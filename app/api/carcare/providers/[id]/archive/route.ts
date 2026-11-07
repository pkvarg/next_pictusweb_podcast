import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { archiveProvider } from '@/lib/carcare/providers'

// POST /api/carcare/providers/[id]/archive — soft-delete a provider (kept for history).
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { id } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.canModify) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const ok = await prisma.$transaction(async (tx) => {
    const provider = await tx.provider.findFirst({
      where: { id, organizationId: session.organizationId!, deletedAt: null },
      select: { id: true },
    })
    if (!provider) return false
    await archiveProvider(tx, id)
    return true
  })
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
