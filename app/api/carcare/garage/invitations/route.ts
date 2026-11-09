import { NextRequest, NextResponse } from 'next/server'
import { GarageRole } from '@prisma/client'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { resolveGarageRole, ensureOwnerMembership, createInvitation } from '@/lib/carcare/garage'
import { assertUserCapacity, TierLimitError, limitMessage } from '@/lib/carcare/limits'

const ROLES: GarageRole[] = ['MEMBER', 'VIEWER']

function localeFromReferer(referer: string | null): string {
  const m = referer?.match(/^https?:\/\/[^/]+\/([a-z]{2})(\/|$)/)
  const loc = m?.[1]
  return loc && ['sk', 'en', 'hu'].includes(loc) ? loc : 'sk'
}

async function sendInviteEmail(params: {
  origin: string
  locale: string
  to: string
  role: GarageRole
  token: string
  inviterName: string | null
}): Promise<boolean> {
  const hono = process.env.NEXT_PUBLIC_HONO_API_URL
  if (!hono) return false
  const inviteUrl = `${params.origin}/${params.locale}/carcare/invite/${params.token}`
  try {
    const res = await fetch(`${hono}/api/pictusweb/client/send-garage-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.to,
        inviteUrl,
        role: params.role,
        inviterName: params.inviterName,
        locale: params.locale,
      }),
    })
    return res.ok
  } catch (error) {
    console.error('carcare garage invite email failed:', error)
    return false
  }
}

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

  let result
  try {
    result = await prisma.$transaction(async (tx) => {
      const { role: callerRole, isLegacyOwner } = await resolveGarageRole(
        tx,
        session.userId,
        session.organizationId!,
      )
      if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') return null

      if (isLegacyOwner) await ensureOwnerMembership(tx, session.userId, session.organizationId!)

      await assertUserCapacity(tx, session.organizationId!)

      const invitation = await createInvitation(tx, {
        organizationId: session.organizationId!,
        email,
        role,
        invitedByUserId: session.userId,
      })
      const inviter = await tx.user.findUnique({
        where: { id: session.userId },
        select: { firstName: true, lastName: true },
      })
      return { invitation, inviter }
    })
  } catch (e) {
    if (e instanceof TierLimitError) {
      const locale = localeFromReferer(request.headers.get('referer'))
      return NextResponse.json({ error: limitMessage(e, locale), limit: e.limit }, { status: 409 })
    }
    throw e
  }

  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const emailSent = await sendInviteEmail({
    origin: new URL(request.url).origin,
    locale: localeFromReferer(request.headers.get('referer')),
    to: email,
    role,
    token: result.invitation.token,
    inviterName:
      [result.inviter?.firstName, result.inviter?.lastName].filter(Boolean).join(' ') || null,
  })

  return NextResponse.json(
    {
      invitation: {
        id: result.invitation.id,
        email: result.invitation.email,
        role: result.invitation.role,
        token: result.invitation.token,
      },
      emailSent,
    },
    { status: 201 },
  )
}
