import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

/**
 * Health probe for stuck onboardings: paid checkouts (pending_onboarding rows
 * that carry a Stripe session id) that have not become real accounts within a
 * grace window. Poll this from a monitor/cron; a non-zero `stuck` count means a
 * paying customer cannot log in. Protected by the ONBOARDING_HEALTH_TOKEN env
 * (sent as `Authorization: Bearer <token>` or `?token=`).
 */
export async function GET(request: NextRequest) {
  const expected = process.env.ONBOARDING_HEALTH_TOKEN
  if (!expected) {
    return NextResponse.json({ error: 'Health check not configured' }, { status: 503 })
  }

  const url = new URL(request.url)
  const provided =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    url.searchParams.get('token') ||
    ''

  if (provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const minutes = Math.max(1, parseInt(url.searchParams.get('minutes') || '15', 10) || 15)
  const cutoff = new Date(Date.now() - minutes * 60 * 1000)

  try {
    const stuck = await prisma.pendingOnboarding.findMany({
      where: {
        stripeSessionId: { not: null },
        createdAt: { lt: cutoff },
      },
      select: {
        id: true,
        email: true,
        stripeSessionId: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      ok: stuck.length === 0,
      stuck: stuck.length,
      graceMinutes: minutes,
      rows: stuck,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 },
    )
  }
}
