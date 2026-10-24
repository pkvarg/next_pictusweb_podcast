import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { decrypt } from '@/lib/crypto'
import { listUnexported, setExported } from '@/lib/doklado'
import { Product } from '@prisma/client'

// Session-authed run endpoint for regular PicDocs users. Max-safety: pictusweb calls Doklado with
// the org's OWN decrypted key (never leaves here), forwards only the document DATA to n8n, then
// marks exported. The Doklado key and the n8n secret are NEVER returned or logged.

const RATE_LIMIT_PER_HOUR = 20
const HOUR_MS = 60 * 60 * 1000
const N8N_TIMEOUT_MS = 120_000
const DEFAULT_N8N_URL = 'https://notifications.pictusweb.sk/webhook/doklado-run'

export async function POST() {
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
    return NextResponse.json({ error: 'This organization is not set up for PicDocs.' }, { status: 400 })
  }
  if (!picDocsOrg.dokladoApiKeyEnc) {
    return NextResponse.json(
      { error: 'Doklado API key not configured for this organization.' },
      { status: 400 },
    )
  }

  // Per-org rate limiting (best-effort atomic): reset the window if stale, else enforce the cap.
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.picDocsOrg.findUnique({
        where: { organizationId },
        select: { runsThisHour: true, rateWindowStart: true },
      })
      const now = new Date()
      const windowStale =
        !current?.rateWindowStart || now.getTime() - current.rateWindowStart.getTime() > HOUR_MS

      if (windowStale) {
        await tx.picDocsOrg.update({
          where: { organizationId },
          data: { runsThisHour: 1, rateWindowStart: now },
        })
        return
      }
      if ((current?.runsThisHour ?? 0) >= RATE_LIMIT_PER_HOUR) {
        throw new RateLimitError()
      }
      await tx.picDocsOrg.update({
        where: { organizationId },
        data: { runsThisHour: { increment: 1 } },
      })
    })
  } catch (err) {
    if (err instanceof RateLimitError) {
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
    console.error('PicDocs run: Doklado list failed:', err?.message)
    await prisma.picDocsRun.update({
      where: { id: run.id },
      data: { status: 'error', errorMessage: 'Doklado list failed', finishedAt: new Date() },
    })
    return NextResponse.json({ error: 'Could not reach Doklado. Please try again.' }, { status: 502 })
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
    console.error('PicDocs run: n8n call failed:', err?.name === 'AbortError' ? 'timeout' : err?.message)
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
      { error: 'The processing service failed. Your documents were not changed; please try again.' },
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
    markNote = 'Documents were emailed but could not be marked exported in Doklado; they may appear again next run.'
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

class RateLimitError extends Error {}
