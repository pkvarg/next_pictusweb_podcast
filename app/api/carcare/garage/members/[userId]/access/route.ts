import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { resolveGarageRole, grantVehicleAccess, revokeVehicleAccess } from '@/lib/carcare/garage'

// POST /api/carcare/garage/members/[userId]/access
// Owner grants or revokes a member's access to one vehicle.
// Body: { vehicleId, grant: boolean }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { userId } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { vehicleId?: string; grant?: boolean }
  if (!body.vehicleId || typeof body.grant !== 'boolean') {
    return NextResponse.json({ error: 'vehicleId and grant are required' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const { role } = await resolveGarageRole(tx, session.userId, session.organizationId!)
    if (role !== 'OWNER' && role !== 'ADMIN') return 'forbidden'

    const membership = await tx.garageMembership.findUnique({
      where: { organizationId_userId: { organizationId: session.organizationId!, userId } },
    })
    if (!membership) return 'not-found'

    const vehicle = await tx.myVehicle.findFirst({
      where: { id: body.vehicleId, organizationId: session.organizationId!, deletedAt: null },
      select: { id: true },
    })
    if (!vehicle) return 'not-found'

    if (body.grant) await grantVehicleAccess(tx, membership.id, body.vehicleId!)
    else await revokeVehicleAccess(tx, membership.id, body.vehicleId!)
    return 'ok'
  })

  if (result === 'ok') return NextResponse.json({ ok: true })
  const status = result === 'not-found' ? 404 : 403
  return NextResponse.json({ error: result }, { status })
}
