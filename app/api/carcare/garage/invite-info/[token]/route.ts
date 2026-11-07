import { NextResponse } from 'next/server'
import prisma from '@/db/db'

// GET /api/carcare/garage/invite-info/[token]
// Public token lookup for the invite accept page: reveals the invited email + role
// (the token is the secret). Also reports whether an account already exists.
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const inv = await prisma.garageInvitation.findUnique({ where: { token } })
  if (!inv || inv.status !== 'PENDING' || inv.expiresAt < new Date()) {
    return NextResponse.json({ valid: false })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: inv.email },
    select: { id: true },
  })

  return NextResponse.json({
    valid: true,
    email: inv.email,
    role: inv.role,
    hasAccount: !!existingUser,
  })
}
