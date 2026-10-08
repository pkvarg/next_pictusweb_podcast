import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

const DAY = 24 * 60 * 60 * 1000

// Retention periods published in the privacy policy (/gdpr, sections 11 and 14).
const CONTACT_LOG_DAYS = 2 * 365
const BOT_LOG_DAYS = 90
const CONFIRMATION_LOG_DAYS = 365
const IP_REPUTATION_DAYS = 90

/**
 * Deletes personal data that is past its published retention period. Intended
 * to be called once a day by a scheduler (n8n). Token-protected
 * (ONBOARDING_HEALTH_TOKEN or CRON_TOKEN).
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
    const now = Date.now()
    const olderThan = (days: number) => new Date(now - days * DAY)

    const [contactLogs, botLogs, confirmationLogs, ipReputations] = await Promise.all([
      prisma.contactLog.deleteMany({ where: { createdAt: { lt: olderThan(CONTACT_LOG_DAYS) } } }),
      prisma.botLog.deleteMany({ where: { createdAt: { lt: olderThan(BOT_LOG_DAYS) } } }),
      prisma.confirmationLog.deleteMany({
        where: { timestamp: { lt: olderThan(CONFIRMATION_LOG_DAYS) } },
      }),
      // Permanent bans are kept; expired temporary bans go once the IP has been quiet.
      prisma.iPReputation.deleteMany({
        where: {
          isPermanentBan: false,
          lastSeen: { lt: olderThan(IP_REPUTATION_DAYS) },
          OR: [{ bannedUntil: null }, { bannedUntil: { lt: new Date(now) } }],
        },
      }),
    ])

    return NextResponse.json({
      ok: true,
      deleted: {
        contactLogs: contactLogs.count,
        botLogs: botLogs.count,
        confirmationLogs: confirmationLogs.count,
        ipReputations: ipReputations.count,
      },
    })
  } catch (error) {
    console.error('data-retention error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
