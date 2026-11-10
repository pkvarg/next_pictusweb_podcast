import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { isAdminSession } from '@/lib/adminGuard'
import { DeliveryStatus } from '@prisma/client'

const STATUSES = new Set(Object.values(DeliveryStatus))

// GET /api/admin/carcare-notifications?status=SCHEDULED&limit=300
// Admin view of the CarCare notification deliveries (replaces the legacy
// vehicle-notifications admin page). Read-only, admin-only.
export async function GET(request: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const statusParam = url.searchParams.get('status') || ''
  const status = STATUSES.has(statusParam as DeliveryStatus)
    ? (statusParam as DeliveryStatus)
    : undefined
  const limit = Math.min(1000, Math.max(1, parseInt(url.searchParams.get('limit') || '300', 10)))

  const [deliveries, grouped] = await Promise.all([
    prisma.notificationDelivery.findMany({
      where: status ? { status } : {},
      orderBy: { scheduledFor: 'desc' },
      take: limit,
      select: {
        id: true,
        stage: true,
        channel: true,
        status: true,
        scheduledFor: true,
        sentAt: true,
        lastError: true,
        recipient: { select: { email: true } },
        occurrence: {
          select: { dueDate: true, vehicle: { select: { registration: true } } },
        },
        recurringEvent: {
          select: { name: true, organization: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.notificationDelivery.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const summary: Record<string, number> = {}
  for (const g of grouped) summary[g.status] = g._count._all

  return NextResponse.json({
    summary,
    count: deliveries.length,
    deliveries: deliveries.map((d) => ({
      id: d.id,
      org: d.recurringEvent.organization?.name ?? '—',
      orgId: d.recurringEvent.organization?.id ?? null,
      vehicle: d.occurrence.vehicle?.registration ?? '—',
      event: d.recurringEvent.name,
      stage: d.stage,
      channel: d.channel,
      recipient: d.recipient?.email ?? '—',
      scheduledFor: d.scheduledFor,
      sentAt: d.sentAt,
      status: d.status,
      lastError: d.lastError,
      dueDate: d.occurrence.dueDate,
    })),
  })
}
