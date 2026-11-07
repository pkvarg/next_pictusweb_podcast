import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { resolveGarageRole } from '@/lib/carcare/garage'

// POST /api/carcare/garage/invitations/[id]/revoke — owner revokes a pending invite.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { id } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ok = await prisma.$transaction(async (tx) => {
    const { role } = await resolveGarageRole(tx, session.userId, session.organizationId!)
    if (role !== 'OWNER' && role !== 'ADMIN') return false
    const inv = await tx.garageInvitation.findUnique({ where: { id } })
    if (!inv || inv.organizationId !== session.organizationId) return false
    await tx.garageInvitation.update({ where: { id }, data: { status: 'REJECTED' } })
    return true
  })

  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ ok: true })
}
