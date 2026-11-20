import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { rateLimit, rateLimitResponse, getClientIP } from '@/lib/rateLimit'

const HONO_API = process.env.NEXT_PUBLIC_HONO_API_URL!

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit: 5 per user+IP per hour
    const ip = getClientIP(request.headers)
    const limit = rateLimit({
      key: `feedback:${session.user.id}:${ip}`,
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000,
    })
    if (!limit.success) return rateLimitResponse(limit.retryAfterMs)

    const { message, category } = await request.json().catch(() => ({}) as any)
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        organizationRelation: { select: { name: true } },
      },
    })
    const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null

    const res = await fetch(`${HONO_API}/api/pictusweb/client/send-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.trim().slice(0, 5000),
        category: typeof category === 'string' ? category.slice(0, 40) : null,
        userName,
        userEmail: user?.email ?? session.user.email ?? null,
        orgName: user?.organizationRelation?.name ?? null,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send feedback' }, { status: 502 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 })
  }
}
