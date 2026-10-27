import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { isAdminSession } from '@/lib/adminGuard'

export interface UserApiAccess {
  isAdmin: boolean
  organizationId: string | null
}

// Resolves who may call the /api/users endpoints. Admins get full cross-org access.
// A signed-in non-admin (a client / fleet manager) is scoped to their own organization,
// so they can manage only their own recipients. Returns null when access is denied.
export async function resolveUserApiAccess(): Promise<UserApiAccess | null> {
  if (await isAdminSession()) {
    return { isAdmin: true, organizationId: null }
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  })

  if (!user?.organizationId) {
    return null
  }

  return { isAdmin: false, organizationId: user.organizationId }
}
