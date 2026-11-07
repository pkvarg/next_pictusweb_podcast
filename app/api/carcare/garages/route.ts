import { NextResponse } from 'next/server'
import prisma from '@/db/db'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'

// GET /api/carcare/garages — the garages the user can act in (for the switcher),
// with the currently active one.
export async function GET() {
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { organizationId: true },
  })

  const memberships = await prisma.garageMembership.findMany({
    where: { userId: session.userId },
    include: { organization: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const garages = memberships.map((m) => ({
    organizationId: m.organizationId,
    name: m.organization.name,
    role: m.role,
  }))

  if (memberships.length === 0 && user?.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { id: true, name: true },
    })
    if (org) garages.push({ organizationId: org.id, name: org.name, role: 'OWNER' })
  }

  return NextResponse.json({ garages, activeOrganizationId: session.organizationId })
}
