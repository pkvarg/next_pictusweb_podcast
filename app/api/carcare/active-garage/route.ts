import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession, ACTIVE_GARAGE_COOKIE } from '@/lib/carcare/apiAuth'

// POST /api/carcare/active-garage — set the user's active garage (validated), stored
// in a cookie that resolveCarCareSession honors. Body: { organizationId }
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { organizationId?: string }
  const target = body.organizationId
  if (!target) return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })

  const membership = await prisma.garageMembership.findUnique({
    where: { organizationId_userId: { organizationId: target, userId: session.userId } },
  })
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { organizationId: true },
  })
  const allowed = !!membership || target === user?.organizationId
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ACTIVE_GARAGE_COOKIE, target, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
