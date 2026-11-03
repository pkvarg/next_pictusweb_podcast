import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { signImpersonationToken } from '@/lib/impersonationToken'

// Mints a short-lived token the admin's browser spends against the 'impersonate' provider to open
// a session as the target user and does not count
// toward the target's login counts (the jwt callback skips the increment for this provider).
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role?.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if ((session.user as any).impersonatedBy) {
    return NextResponse.json({ error: 'Already impersonating' }, { status: 409 })
  }

  const body = await request.json().catch(() => ({}))
  const userId = typeof body.userId === 'string' ? body.userId : null
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, deletedAt: true },
  })
  if (!target || target.deletedAt) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const adminId = session.user.id
  console.log(`IMPERSONATE_START admin=${adminId} target=${target.id} targetEmail=${target.email}`)

  const token = signImpersonationToken({ sub: target.id, by: adminId })
  return NextResponse.json({ token })
}
