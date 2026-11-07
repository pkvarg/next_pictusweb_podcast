import { NextResponse } from 'next/server'
import prisma from '@/db/db'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { resolveGarageRole } from '@/lib/carcare/garage'

// GET /api/carcare/garage — members, pending invitations, and the caller's role.
export async function GET() {
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.$transaction(async (tx) => {
    const { role, isLegacyOwner } = await resolveGarageRole(
      tx,
      session.userId,
      session.organizationId!,
    )
    if (role === null) return null

    const memberships = await tx.garageMembership.findMany({
      where: { organizationId: session.organizationId! },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    })

    const invitations = await tx.garageInvitation.findMany({
      where: {
        organizationId: session.organizationId!,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    const currentUser = await tx.user.findUnique({
      where: { id: session.userId },
      select: { firstName: true, lastName: true, email: true },
    })

    return { role, isLegacyOwner, memberships, invitations, currentUser }
  })

  if (!data) return NextResponse.json({ error: 'No access' }, { status: 403 })

  const canManage = data.role === 'OWNER' || data.role === 'ADMIN'
  return NextResponse.json({
    role: data.role,
    canManage,
    currentUserId: session.userId,
    members:
      data.isLegacyOwner && data.memberships.length === 0
        ? [
            {
              userId: session.userId,
              role: 'OWNER' as const,
              name:
                [data.currentUser?.firstName, data.currentUser?.lastName]
                  .filter(Boolean)
                  .join(' ') || null,
              email: data.currentUser?.email ?? null,
              isYou: true,
              implicit: true,
            },
          ]
        : data.memberships.map((m) => ({
            userId: m.userId,
            role: m.role,
            name: [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || null,
            email: m.user.email,
            isYou: m.userId === session.userId,
            implicit: false,
          })),
    invitations: data.invitations.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      token: i.token,
      expiresAt: i.expiresAt,
    })),
  })
}
