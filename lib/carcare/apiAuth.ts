import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'

export interface CarCareSession {
  userId: string
  organizationId: string | null
  role: string
  garageRole: 'OWNER' | 'MEMBER' | 'VIEWER'
  canModify: boolean
}

// Resolves the signed-in user for CarCare API routes. Returns null when unauthenticated.
// The active garage org is the org the user owns/belongs to as a garage member, not
// necessarily their account's home org: an invited member's home org (e.g. a PicDocs
// org) differs from the garage they joined, so prefer a membership org.
export async function resolveCarCareSession(): Promise<CarCareSession | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true, role: true },
  })
  if (!user) return null

  let organizationId = user.organizationId
  const memberships = await prisma.garageMembership.findMany({
    where: { userId: user.id },
    select: { organizationId: true, role: true },
    orderBy: { createdAt: 'asc' },
  })

  let garageRole: 'OWNER' | 'MEMBER' | 'VIEWER' = 'OWNER'
  if (memberships.length > 0) {
    const own = memberships.find((m) => m.organizationId === user.organizationId)
    const active = own ?? memberships[0]
    organizationId = active.organizationId
    garageRole = active.role
  }
  if (user.role === 'ADMIN') garageRole = 'OWNER'

  return {
    userId: user.id,
    organizationId,
    role: user.role,
    garageRole,
    canModify: garageRole !== 'VIEWER',
  }
}
