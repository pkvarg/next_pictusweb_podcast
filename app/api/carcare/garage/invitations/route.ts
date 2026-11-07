import { NextRequest, NextResponse } from 'next/server'
import { GarageRole } from '@prisma/client'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { resolveGarageRole, ensureOwnerMembership, createInvitation } from '@/lib/carcare/garage'

const ROLES: GarageRole[] = ['MEMBER', 'VIEWER']

// POST /api/carcare/garage/invitations — owner invites someone by email.
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { email?: string; role?: GarageRole }
  const email = body.email?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }
  const role: GarageRole = body.role && ROLES.includes(body.role) ? body.role : 'MEMBER'

  const result = await prisma.$transaction(async (tx) => {
    const { role: callerRole, isLegacyOwner } = await resolveGarageRole(
      tx,
      session.userId,
      session.organizationId!,
    )
    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') return null

    if (isLegacyOwner) await ensureOwnerMembership(tx, session.userId, session.organizationId!)

    return createInvitation(tx, {
      organizationId: session.organizationId!,
      email,
      role,
      invitedByUserId: session.userId,
    })
  })

  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json(
    { invitation: { id: result.id, email: result.email, role: result.role, token: result.token } },
    { status: 201 },
  )
}
