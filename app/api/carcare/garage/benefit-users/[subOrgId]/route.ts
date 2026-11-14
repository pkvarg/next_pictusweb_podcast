import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { resolveGarageRole } from '@/lib/carcare/garage'

// Optional per-user cap (Option B): an empty value clears the cap so the user draws from the
// parent's shared pool; a number sets an upper bound this benefit user can never exceed.
function clampLimit(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Math.round(Number(v))
  return Number.isFinite(n) && n >= 0 ? n : null
}

// PATCH /api/carcare/garage/benefit-users/[subOrgId] — set a benefit sub-org's optional
// vehicle/notification caps. Only a managing user of the parent org may do this.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ subOrgId: string }> },
) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { subOrgId } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as {
    vehiclesLimit?: unknown
    notificationsLimit?: unknown
  }

  const result = await prisma.$transaction(async (tx) => {
    const { role } = await resolveGarageRole(tx, session.userId, session.organizationId!)
    if (role !== 'OWNER' && role !== 'ADMIN') return 'forbidden'

    const sub = await tx.organization.findUnique({
      where: { id: subOrgId },
      select: { isBenefitOrg: true, parentOrganizationId: true },
    })
    if (!sub || !sub.isBenefitOrg || sub.parentOrganizationId !== session.organizationId) {
      return 'not-found'
    }

    await tx.organization.update({
      where: { id: subOrgId },
      data: {
        vehiclesLimit: clampLimit(body.vehiclesLimit),
        notificationsLimit: clampLimit(body.notificationsLimit),
      },
    })
    return 'ok'
  })

  if (result === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (result === 'not-found') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
