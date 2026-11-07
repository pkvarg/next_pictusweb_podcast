import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'

export interface CarCareSession {
  userId: string
  organizationId: string | null
  role: string
}

// Resolves the signed-in user for CarCare API routes. Returns null when unauthenticated.
export async function resolveCarCareSession(): Promise<CarCareSession | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true, role: true },
  })
  if (!user) return null
  return { userId: user.id, organizationId: user.organizationId, role: user.role }
}
