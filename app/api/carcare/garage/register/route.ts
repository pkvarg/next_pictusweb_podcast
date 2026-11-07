import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'

// POST /api/carcare/garage/register
// Brand-new invitee: create an account bound to the invitation's email + garage,
// then join the garage with the invited role. Body: { token, firstName, lastName, password, phoneNumber? }
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })

  const ip = getClientIP(request.headers)
  const limit = rateLimit({
    key: `carcare_invite_register:${ip}`,
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,
  })
  if (!limit.success) return rateLimitResponse(limit.retryAfterMs)

  const body = (await request.json().catch(() => ({}))) as {
    token?: string
    firstName?: string
    lastName?: string
    password?: string
    phoneNumber?: string
  }
  const { token, firstName, lastName, password } = body
  if (!token || !firstName?.trim() || !lastName?.trim() || !password) {
    return NextResponse.json(
      { error: 'token, firstName, lastName and password are required' },
      { status: 400 },
    )
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'PASSWORD_TOO_SHORT' }, { status: 400 })
  }

  const inv = await prisma.garageInvitation.findUnique({ where: { token } })
  if (!inv || inv.status !== 'PENDING' || inv.expiresAt < new Date()) {
    return NextResponse.json({ error: 'INVALID_INVITATION' }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: inv.email },
    select: { id: true },
  })
  if (existingUser) {
    return NextResponse.json({ error: 'EMAIL_ALREADY_EXISTS' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const phoneNumber = body.phoneNumber ? body.phoneNumber.replace(/\s+/g, '') : null

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.garageInvitation.findUnique({ where: { token } })
    if (!fresh || fresh.status !== 'PENDING' || fresh.expiresAt < new Date()) {
      throw new Error('INVALID_INVITATION')
    }

    const user = await tx.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: inv.email,
        password: hashedPassword,
        phoneNumber,
        role: 'CLIENT',
        active: true,
        organizationId: inv.organizationId,
        isFleetManager: false,
        loginProvider: 'credentials',
        emailVerified: new Date(),
      },
      select: { id: true },
    })

    await tx.garageMembership.upsert({
      where: { organizationId_userId: { organizationId: inv.organizationId, userId: user.id } },
      create: { organizationId: inv.organizationId, userId: user.id, role: inv.role },
      update: { role: inv.role },
    })
    await tx.garageInvitation.update({ where: { id: inv.id }, data: { status: 'ACCEPTED' } })
  })

  return NextResponse.json({ ok: true, email: inv.email })
}
