import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { decrypt } from '@/lib/crypto'
import { listUnexported, setExported, DokladoRateLimitError } from '@/lib/doklado'
import { enforcePicDocsRateLimit, PicDocsRateLimitError } from '@/lib/picdocsRateLimit'
import { sameOriginOk } from '@/lib/sameOrigin'
import { Product } from '@prisma/client'

// Session-authed run endpoint for regular PicDocs users. Max-safety: pictusweb calls Doklado with
// the org's OWN decrypted key (never leaves here), forwards only the document DATA to n8n, then
// marks exported. The Doklado key and the n8n secret are NEVER returned or logged.

const N8N_TIMEOUT_MS = 120_000
const DEFAULT_N8N_URL = 'https://notifications.pictusweb.sk/webhook/doklado-run'

export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const session = await getServerSession(authOptions)
  const organizationId = (session?.user as any)?.organizationId as string | undefined
  if (!session?.user || !organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Defense in depth: this endpoint is for PicDocs orgs only.
  const product = (session.user as any).product as string | undefined
  if (product !== Product.PICDOCS) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Load the org's PicDocs config.
  const picDocsOrg = await prisma.picDocsOrg.findUnique({ where: { organizationId } })
  if (!picDocsOrg) {
    return NextResponse.json(
      { error: 'This organization is not set up for PicDocs.' },
      { status: 400 },
    )
  }
  if (!picDocsOrg.dokladoApiKeyEnc) {
    return NextResponse.json(
      { error: 'Doklado API key not configured for this organization.' },
      { status: 400 },
    )
  }

  // Per-org rate limiting (shared with the reset endpoint).
  try {
    await enforcePicDocsRateLimit(organizationId)
  } catch (err) {
    if (err instanceof PicDocsRateLimitError) {
      return NextResponse.json(
        { error: 'Too many runs this hour. Please try again later.' },
        { status: 429 },
      )
    }
    throw err
  }

  const key = decrypt(picDocsOrg.dokladoApiKeyEnc)
  const { dokladoOrganizationId, recipientEmail } = picDocsOrg
  const userId = (session.user as any).id as string | undefined

  // Open an audit record for this run.
  const run = await prisma.picDocsRun.create({
    data: { organizationId, userId: userId ?? null, status: 'running' },
  })

  // 1) Pull unexported documents from Doklado.
  let documents
  try {
    documents = await listUnexported(key, dokladoOrganizationId)
  } catch (err: any) {
    const rateLimited = err instanceof DokladoRateLimitError
    console.error('PicDocs run: Doklado list failed:', err?.message)
    await prisma.picDocsRun.update({
      where: { id: run.id },
      data: {
        status: 'error',
        errorMessage: rateLimited ? 'Doklado rate limit' : 'Doklado list failed',
        finishedAt: new Date(),
      },
    })
    if (rateLimited) {
      return NextResponse.json(
        {
          error: 'Doklado is busy (rate limit). Please try again in a few minutes.',
          code: 'doklado_rate_limited',
        },
        { status: 429 },
      )
    }
    return NextResponse.json(
      { error: 'Could not reach Doklado. Please try again.' },
      { status: 502 },
    )
  }

  // Nothing to do: close out without calling n8n or marking anything.
  if (documents.length === 0) {
    await prisma.picDocsRun.update({
      where: { id: run.id },
      data: { status: 'success', processedCount: 0, finishedAt: new Date() },
    })
    await prisma.picDocsOrg.update({
      where: { organizationId },
      data: { lastRunAt: new Date() },
    })
    return NextResponse.json({ status: 'nothing', message: 'No new documents to process.' })
  }

  const documentIds = documents.map((d) => d.documentId)

  // 2) Forward the document DATA to n8n and await the full pipeline (Nova + email).
  const n8nUrl = process.env.N8N_DOKLADO_URL || DEFAULT_N8N_URL
  const n8nSecret = process.env.N8N_DOKLADO_SECRET || ''
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS)
  let n8nOk = false
  try {
    const res = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': n8nSecret,
      },
      body: JSON.stringify({ documents, recipientEmail }),
      signal: controller.signal,
    })
    if (res.ok) {
      const body = (await res.json().catch(() => ({}))) as { success?: boolean; status?: string }
      n8nOk = body.success !== false && body.status !== 'error'
    }
  } catch (err: any) {
    console.error(
      'PicDocs run: n8n call failed:',
      err?.name === 'AbortError' ? 'timeout' : err?.message,
    )
  } finally {
    clearTimeout(timeout)
  }

  if (!n8nOk) {
    // Do NOT mark exported — the docs stay unexported so the next run retries them.
    await prisma.picDocsRun.update({
      where: { id: run.id },
      data: { status: 'error', errorMessage: 'Processing service failed', finishedAt: new Date() },
    })
    return NextResponse.json(
      {
        error: 'The processing service failed. Your documents were not changed; please try again.',
      },
      { status: 502 },
    )
  }

  // 3) n8n already emailed → mark docs exported. A failure here means only a possible duplicate
  // next run, so we flag it but keep the run successful (the email is the real deliverable).
  let markNote: string | undefined
  try {
    await setExported(key, documentIds)
  } catch (err: any) {
    console.error('PicDocs run: setExported failed after email sent:', err?.message)
    markNote =
      'Documents were emailed but could not be marked exported in Doklado; they may appear again next run.'
  }

  await prisma.picDocsRun.update({
    where: { id: run.id },
    data: {
      status: 'success',
      processedCount: documents.length,
      errorMessage: markNote ?? null,
      finishedAt: new Date(),
    },
  })
  await prisma.picDocsOrg.update({
    where: { organizationId },
    data: { lastRunAt: new Date() },
  })

  return NextResponse.json({
    status: 'success',
    processedCount: documents.length,
    recipientEmail,
    ...(markNote ? { note: markNote } : {}),
  })
}
