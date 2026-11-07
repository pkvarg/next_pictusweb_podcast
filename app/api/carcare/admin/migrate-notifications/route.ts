import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { migrateVehicleNotifications } from '@/lib/carcare/migrateNotifications'

// POST /api/carcare/admin/migrate-notifications?dryRun=true
// One-off: convert legacy vehicle_notifications -> CarCare vehicles/events/occurrences.
// Token-protected (CRON_TOKEN or ONBOARDING_HEALTH_TOKEN). Idempotent; run dryRun first.
export async function POST(request: NextRequest) {
  const expected = process.env.CRON_TOKEN || process.env.ONBOARDING_HEALTH_TOKEN
  if (!expected) return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  const url = new URL(request.url)
  const provided =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    url.searchParams.get('token') ||
    ''
  if (provided !== expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dryRun = url.searchParams.get('dryRun') === 'true'
  const summary = await migrateVehicleNotifications(prisma, { dryRun })
  return NextResponse.json(summary)
}
