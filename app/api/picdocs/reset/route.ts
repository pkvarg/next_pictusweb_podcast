import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { decrypt } from '@/lib/crypto'
import { listExported, setUnexported, DokladoRateLimitError } from '@/lib/doklado'
import { enforcePicDocsRateLimit, PicDocsRateLimitError } from '@/lib/picdocsRateLimit'
import { sameOriginOk } from '@/lib/sameOrigin'
import { Product } from '@prisma/client'

// TESTING helper: resets this org's already-exported Doklado documents back to not_exported so they
// can be reprocessed. Session-authed (PicDocs users only). Consider removing or admin-gating for production.
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const session = await getServerSession(authOptions)
  const organizationId = (session?.user as any)?.organizationId as string | undefined
  if (!session?.user || !organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const product = (session.user as any).product as string | undefined
  if (product !== Product.PICDOCS) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  // Per-org rate limiting (shared with the run endpoint) — reset also spends Doklado quota.
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

  try {
    // Safety bound: only recently-created documents, so this never un-exports an account's whole history.
    const since = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    const documents = await listExported(key, picDocsOrg.dokladoOrganizationId, {
      dateType: 'create',
      dateFrom: since,
    })
    const documentIds = documents.map((d) => d.documentId)
    await setUnexported(key, documentIds)
    return NextResponse.json({ status: 'ok', reset: documentIds.length })
  } catch (err: any) {
    console.error('PicDocs reset: failed:', err?.message)
    if (err instanceof DokladoRateLimitError) {
      return NextResponse.json(
        {
          error: 'Doklado is busy (rate limit). Please try again in a few minutes.',
          code: 'doklado_rate_limited',
        },
        { status: 429 },
      )
    }
    return NextResponse.json({ error: 'Could not reset documents in Doklado.' }, { status: 502 })
  }
}
