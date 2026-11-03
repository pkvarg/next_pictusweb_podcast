import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { signImpersonationToken } from '@/lib/impersonationToken'

// Mints a token that returns the admin to their own session. Only callable from within an
// impersonated session; the token carries no `by`, so the restored session is a plain admin session.
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  const session = await getServerSession(authOptions)
  const adminId = (session?.user as any)?.impersonatedBy as string | undefined
  if (!session?.user || !adminId) {
    return NextResponse.json({ error: 'Not impersonating' }, { status: 403 })
  }

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { id: true, role: true, deletedAt: true },
  })
  if (!admin || admin.deletedAt || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin not found' }, { status: 403 })
  }

  console.log(`IMPERSONATE_STOP admin=${admin.id} from=${session.user.id}`)

  const token = signImpersonationToken({ sub: admin.id })
  return NextResponse.json({ token })
}
