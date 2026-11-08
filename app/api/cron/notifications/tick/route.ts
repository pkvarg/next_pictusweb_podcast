import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { planDeliveries, dispatchDue } from '@/lib/carcare/scheduler'
import { honoChannels } from '@/lib/carcare/channels'

/**
 * CarCare notification tick. Intended to be called on an interval by a scheduler
 * (n8n), the same token-protected pattern as the other crons. Two idempotent passes:
 *   1. plan — materialize notification_deliveries for open occurrences
 *   2. dispatch — send the deliveries that are due (claim with SKIP LOCKED)
 * Token-protected (CRON_TOKEN or ONBOARDING_HEALTH_TOKEN).
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
    // 1. Planning pass (self-healing): materialize deliveries for non-terminal occurrences.
    const open = await prisma.eventOccurrence.findMany({
      where: {
        status: { in: ['UPCOMING', 'ACTION_REQUIRED', 'ARRANGED'] },
        dueDate: { not: null },
        recurringEvent: {
          deletedAt: null,
          paused: false,
          OR: [
            { responsibleUserId: { not: null } },
            { organization: { notificationRecipients: { some: {} } } },
          ],
        },
      },
      select: { id: true },
    })
    for (const o of open) {
      await prisma.$transaction((tx) => planDeliveries(tx, o.id))
    }

    // 2. Dispatch pass.
    const result = await dispatchDue(prisma, honoChannels)

    return NextResponse.json({ planned: open.length, ...result })
  } catch (error) {
    console.error('CARCARE_TICK_ERROR', error)
    return NextResponse.json({ error: 'Tick failed' }, { status: 500 })
  }
}
