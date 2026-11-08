import { NextRequest, NextResponse } from 'next/server'
import { RecurrenceType } from '@prisma/client'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canAccessVehicle, canModifyVehicle } from '@/lib/carcare/garage'

const num = (d: { toNumber(): number } | null | undefined) => (d ? d.toNumber() : null)

// GET /api/carcare/events/[id] — full recurring-event detail for the event page:
// definition, current + historical occurrences, notification rules, and the
// garage members / providers needed by the responsible-person and provider pickers.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.recurringEvent.findFirst({
      where: { id, deletedAt: null },
      include: {
        vehicle: {
          select: { id: true, registration: true, nickname: true, make: true, model: true },
        },
        preferredProvider: { select: { id: true, name: true } },
        responsibleUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        rules: { where: { active: true } },
      },
    })
    if (!event) return null
    if (!(await canAccessVehicle(tx, session.userId, event.vehicleId))) return 'forbidden'

    const occurrences = await tx.eventOccurrence.findMany({
      where: { recurringEventId: id },
      include: {
        appointments: {
          where: { status: 'BOOKED' },
          orderBy: { scheduledAt: 'asc' },
          take: 1,
          include: { provider: { select: { id: true, name: true, phone: true, email: true } } },
        },
      },
      orderBy: { sequenceNo: 'desc' },
    })

    const members = await tx.garageMembership.findMany({
      where: { organizationId: session.organizationId! },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    })
    const providers = await tx.provider.findMany({
      where: { organizationId: session.organizationId!, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
    const me = await tx.user.findUnique({
      where: { id: session.userId },
      select: { quietHoursStart: true, quietHoursEnd: true },
    })
    return { event, occurrences, members, providers, me }
  })

  if (result === null) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (result === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { event, occurrences, members, providers, me } = result
  const now = Date.now()
  const open = occurrences.find((o) =>
    ['UPCOMING', 'ACTION_REQUIRED', 'ARRANGED'].includes(o.status),
  )
  const memberName = (u: { firstName: string | null; lastName: string | null; email: string }) =>
    [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email

  return NextResponse.json({
    canModify: session.canModify,
    event: {
      id: event.id,
      name: event.name,
      category: event.category,
      kind: event.kind,
      actionType: event.actionType,
      recurrenceType: event.recurrenceType,
      intervalMonths: event.intervalMonths,
      intervalDays: event.intervalDays,
      intervalKm: event.intervalKm,
      seasonalMonth: event.seasonalMonth,
      seasonalDay: event.seasonalDay,
      expectedCost: num(event.expectedCost),
      currency: event.currency,
      paused: event.paused,
      responsibleUserId: event.responsibleUserId,
      preferredProviderId: event.preferredProviderId,
      responsibleUser: event.responsibleUser
        ? { id: event.responsibleUser.id, name: memberName(event.responsibleUser) }
        : null,
    },
    vehicle: event.vehicle,
    current: open
      ? {
          id: open.id,
          status: open.status,
          dueDate: open.dueDate,
          dueMileage: open.dueMileage,
          overdue: !!open.dueDate && open.dueDate.getTime() < now && open.status !== 'ARRANGED',
          appointment: open.appointments[0]
            ? {
                scheduledAt: open.appointments[0].scheduledAt,
                provider: open.appointments[0].provider,
              }
            : null,
        }
      : null,
    history: occurrences
      .filter((o) => o.status === 'COMPLETED')
      .map((o) => ({
        id: o.id,
        completedAt: o.completedAt,
        completedMileage: o.completedMileage,
        cost: num(o.actualCost),
        currency: o.currency,
        notes: o.notes,
      })),
    rules: event.rules.map((r) => ({
      stage: r.stage,
      leadDays: r.leadDays,
      channels: r.channels,
      repeatUntilActioned: r.repeatUntilActioned,
      repeatEveryDays: r.repeatEveryDays,
    })),
    members: members.map((m) => ({ userId: m.userId, name: memberName(m.user) })),
    providers,
    quietHours: { start: me?.quietHoursStart ?? null, end: me?.quietHoursEnd ?? null },
  })
}

// PATCH /api/carcare/events/[id] — edit recurrence/classification, responsible person,
// preferred provider, expected cost, paused, and the current occurrence's due date.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { id } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  const ok = await prisma.$transaction(async (tx) => {
    const event = await tx.recurringEvent.findFirst({
      where: { id, deletedAt: null },
      select: { vehicleId: true },
    })
    if (!event) return 'not-found'
    if (!(await canModifyVehicle(tx, session.userId, event.vehicleId))) return 'forbidden'

    const data: Record<string, unknown> = {}
    if (typeof body.name === 'string' && body.name.trim())
      data.name = body.name.trim().slice(0, 120)
    if (typeof body.recurrenceType === 'string' && body.recurrenceType in RecurrenceType)
      data.recurrenceType = body.recurrenceType
    if ('intervalMonths' in body) data.intervalMonths = body.intervalMonths ?? null
    if ('intervalDays' in body) data.intervalDays = body.intervalDays ?? null
    if ('intervalKm' in body) data.intervalKm = body.intervalKm ?? null
    if ('seasonalMonth' in body) data.seasonalMonth = body.seasonalMonth ?? null
    if ('seasonalDay' in body) data.seasonalDay = body.seasonalDay ?? null
    if ('expectedCost' in body) data.expectedCost = body.expectedCost ?? null
    if ('paused' in body) data.paused = !!body.paused
    if ('preferredProviderId' in body) data.preferredProviderId = body.preferredProviderId || null
    if ('responsibleUserId' in body) {
      const uid = (body.responsibleUserId as string) || null
      if (uid) {
        const member = await tx.garageMembership.findUnique({
          where: {
            organizationId_userId: { organizationId: session.organizationId!, userId: uid },
          },
        })
        if (!member) return 'bad-member'
      }
      data.responsibleUserId = uid
    }
    if (Object.keys(data).length > 0) await tx.recurringEvent.update({ where: { id }, data })

    if ('dueDate' in body) {
      const open = await tx.eventOccurrence.findFirst({
        where: {
          recurringEventId: id,
          status: { in: ['UPCOMING', 'ACTION_REQUIRED', 'ARRANGED'] },
        },
        orderBy: { sequenceNo: 'desc' },
        select: { id: true },
      })
      if (open) {
        await tx.eventOccurrence.update({
          where: { id: open.id },
          data: { dueDate: body.dueDate ? new Date(body.dueDate as string) : null },
        })
      }
    }
    return 'ok'
  })

  if (ok === 'ok') return NextResponse.json({ ok: true })
  const status = ok === 'not-found' ? 404 : ok === 'bad-member' ? 400 : 403
  return NextResponse.json({ error: ok }, { status })
}
