import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { resolveGarageRole, removeMember } from '@/lib/carcare/garage'

// POST /api/carcare/garage/members/[userId]/remove — owner removes a member.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { userId } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await prisma.$transaction(async (tx) => {
    const { role } = await resolveGarageRole(tx, session.userId, session.organizationId!)
    if (role !== 'OWNER' && role !== 'ADMIN') return 'forbidden'
    if (userId === session.userId) return 'self'

    const target = await tx.garageMembership.findUnique({
      where: { organizationId_userId: { organizationId: session.organizationId!, userId } },
    })
    if (!target) return 'not-found'
    if (target.role === 'OWNER') return 'owner'

    await removeMember(tx, session.organizationId!, userId)
    return 'ok'
  })

  if (result === 'ok') return NextResponse.json({ ok: true })
  const status = result === 'not-found' ? 404 : 403
  return NextResponse.json({ error: result }, { status })
}
