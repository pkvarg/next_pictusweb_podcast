import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

const HONO_API = process.env.NEXT_PUBLIC_HONO_API_URL

/**
 * Sends "your free/gifted access is ending" reminder emails. Intended to be
 * called once a day by a scheduler (n8n). Emails an org's fleet manager when
 * their trial ends in 3 days and again on the expiry day — only for orgs with
 * no active subscription. Token-protected (ONBOARDING_HEALTH_TOKEN or CRON_TOKEN).
 */
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_TOKEN || process.env.ONBOARDING_HEALTH_TOKEN
  if (!expected) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }
  const url = new URL(request.url)
  const provided =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    url.searchParams.get('token') ||
    ''
  if (provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const DAY = 24 * 60 * 60 * 1000
    const startToday = new Date()
    startToday.setHours(0, 0, 0, 0)
    const windowEnd = new Date(startToday.getTime() + 4 * DAY) // today .. +3 days

    const orgs = await prisma.organization.findMany({
      where: {
        deletedAt: null,
        freeTrialEndDate: { not: null, gte: startToday, lt: windowEnd },
        OR: [{ stripeSubscriptionStatus: null }, { stripeSubscriptionStatus: 'canceled' }],
      },
      select: {
        id: true,
        freeTrialEndDate: true,
        manuallyPaid: true,
        tierRelation: { select: { name: true } },
      },
    })

    const appUrl = process.env.NEXTAUTH_URL || 'https://www.pictusweb.sk'
    let sent = 0
    const results: { orgId: string; daysLeft: number; emailed: boolean }[] = []

    for (const org of orgs) {
      if (!org.freeTrialEndDate) continue
      const endDay = new Date(org.freeTrialEndDate)
      endDay.setHours(0, 0, 0, 0)
      const daysLeft = Math.round((endDay.getTime() - startToday.getTime()) / DAY)

      // Remind 3 days before and on the expiry day only.
      if (daysLeft !== 3 && daysLeft !== 0) continue

      const user = await prisma.user.findFirst({
        where: { organizationId: org.id, active: true, deletedAt: null },
        orderBy: { isFleetManager: 'desc' },
        select: { email: true, firstName: true },
      })
      if (!user?.email) {
        results.push({ orgId: org.id, daysLeft, emailed: false })
        continue
      }

      const endDateStr = org.freeTrialEndDate.toLocaleDateString('sk-SK')
      const ok = await fetch(`${HONO_API}/api/pictusweb/client/send-trial-expiry-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          firstName: user.firstName || '',
          tierName: org.tierRelation?.name || 'BASIC',
          endDate: endDateStr,
          daysLeft,
          loginUrl: `${appUrl}/sk/client`,
          locale: 'sk',
          manuallyPaid: org.manuallyPaid,
        }),
      })
        .then((r) => r.ok)
        .catch(() => false)

      if (ok) sent++
      results.push({ orgId: org.id, daysLeft, emailed: ok })
    }

    return NextResponse.json({ ok: true, candidates: orgs.length, sent, results })
  } catch (error) {
    console.error('trial-expiry-reminders error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
