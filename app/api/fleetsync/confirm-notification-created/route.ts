import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/db/db'

const HONO_API = process.env.NEXT_PUBLIC_HONO_API_URL

/**
 * Sends the logged-in client a "your reminder was created" confirmation email,
 * but ONLY if their organization opted in (confirmNotificationCreation). No-op
 * otherwise. Called after a notification/batch is created.
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    })
    if (!token?.id && !token?.email) {
      return NextResponse.json({ sent: false }, { status: 200 })
    }

    const organizationId = token.organizationId as string | undefined
    if (!organizationId) return NextResponse.json({ sent: false }, { status: 200 })

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { confirmNotificationCreation: true },
    })
    if (!org?.confirmNotificationCreation) {
      return NextResponse.json({ sent: false }, { status: 200 })
    }

    const user = await prisma.user.findFirst({
      where: {
        ...(token.id ? { id: token.id as string } : { email: token.email as string }),
        deletedAt: null,
        active: true,
      },
      select: { email: true, firstName: true },
    })
    if (!user?.email) return NextResponse.json({ sent: false }, { status: 200 })

    const body = await request.json().catch(() => ({}))
    const locale = typeof body?.locale === 'string' ? body.locale : 'sk'

    await fetch(`${HONO_API}/api/pictusweb/client/send-notification-created-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, firstName: user.firstName || '', locale }),
    }).catch(() => {})

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error('confirm-notification-created error:', error)
    return NextResponse.json({ sent: false }, { status: 200 })
  }
}
