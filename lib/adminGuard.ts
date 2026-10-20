import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Server actions and /api routes are reachable without the admin pages (middleware skips /api and
// actions are plain POSTs), so anything that changes data or spends OpenAI/ElevenLabs credit checks here.
export async function isAdminSession(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  return role === 'ADMIN' || role === 'admin'
}

export async function assertAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    throw new Error('Neautorizovaný prístup')
  }
}
