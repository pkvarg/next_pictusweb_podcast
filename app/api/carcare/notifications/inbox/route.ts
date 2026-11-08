import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'

const vehName = (v: {
  nickname: string | null
  make: string | null
  model: string | null
  registration: string
}) => v.nickname || [v.make, v.model].filter(Boolean).join(' ') || v.registration

// GET /api/carcare/notifications/inbox — the signed-in user's in-app notifications
// (dispatched IN_APP deliveries), newest first, plus the unread count.
export async function GET() {
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const baseWhere = {
    recipientUserId: session.userId,
    channel: 'IN_APP' as const,
    status: 'SENT' as const,
  }

  const [deliveries, unread] = await Promise.all([
    prisma.notificationDelivery.findMany({
      where: baseWhere,
      orderBy: { sentAt: 'desc' },
      take: 30,
      include: {
        recurringEvent: {
          select: {
            id: true,
            name: true,
            vehicle: {
              select: { nickname: true, make: true, model: true, registration: true },
            },
          },
        },
        occurrence: { select: { dueDate: true } },
      },
    }),
    prisma.notificationDelivery.count({ where: { ...baseWhere, readAt: null } }),
  ])

  return NextResponse.json({
    unread,
    items: deliveries.map((d) => ({
      id: d.id,
      stage: d.stage,
      eventId: d.recurringEventId,
      eventName: d.recurringEvent.name,
      vehicle: vehName(d.recurringEvent.vehicle),
      registration: d.recurringEvent.vehicle.registration,
      dueDate: d.occurrence.dueDate,
      sentAt: d.sentAt,
      readAt: d.readAt,
    })),
  })
}

// POST /api/carcare/notifications/inbox — mark in-app notifications read.
// Body: { ids?: string[], all?: boolean }
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { ids?: string[]; all?: boolean }
  const baseWhere = {
    recipientUserId: session.userId,
    channel: 'IN_APP' as const,
    status: 'SENT' as const,
    readAt: null,
  }

  if (body.all) {
    await prisma.notificationDelivery.updateMany({ where: baseWhere, data: { readAt: new Date() } })
  } else if (Array.isArray(body.ids) && body.ids.length > 0) {
    const ids = body.ids.filter((x) => typeof x === 'string')
    await prisma.notificationDelivery.updateMany({
      where: { ...baseWhere, id: { in: ids } },
      data: { readAt: new Date() },
    })
  }

  return NextResponse.json({ ok: true })
}
