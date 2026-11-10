import { NextRequest, NextResponse } from 'next/server'
import { Powertrain } from '@prisma/client'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canAccessVehicle, canModifyVehicle } from '@/lib/carcare/garage'
import { suggestTemplatesForVehicle } from '@/lib/carcare/vehicles'

// GET /api/carcare/vehicles/[id]
// Full detail for a single vehicle: spec, open events, recent history,
// cost-this-year, latest mileage, and not-yet-activated template suggestions.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))

  const result = await prisma.$transaction(async (tx) => {
    if (!(await canAccessVehicle(tx, session.userId, id))) return null

    const vehicle = await tx.myVehicle.findFirst({ where: { id, deletedAt: null } })
    if (!vehicle) return null

    const occInclude = {
      recurringEvent: {
        select: { id: true, name: true, category: true, kind: true, actionType: true },
      },
      appointments: {
        where: { status: 'BOOKED' as const },
        orderBy: { scheduledAt: 'asc' as const },
        take: 1,
        include: { provider: { select: { id: true, name: true } } },
      },
    }

    const open = await tx.eventOccurrence.findMany({
      where: { vehicleId: id, status: { in: ['UPCOMING', 'ACTION_REQUIRED', 'ARRANGED'] } },
      include: occInclude,
      orderBy: { dueDate: 'asc' },
    })

    const history = await tx.eventOccurrence.findMany({
      where: { vehicleId: id, status: 'COMPLETED' },
      include: { recurringEvent: { select: { id: true, name: true, category: true } } },
      orderBy: { completedAt: 'desc' },
      take: 10,
    })

    const completedCost = await tx.eventOccurrence.aggregate({
      _sum: { actualCost: true },
      where: { vehicleId: id, status: 'COMPLETED', completedAt: { gte: yearStart } },
    })
    const expenseCost = await tx.myVehicleExpense.aggregate({
      _sum: { cost: true },
      where: { vehicleId: id, deletedAt: null, date: { gte: yearStart } },
    })

    const latestMileage = await tx.myVehicleMileage.findFirst({
      where: { vehicleId: id, deletedAt: null },
      orderBy: { date: 'desc' },
      select: { kilometers: true, date: true },
    })

    const activeEvents = await tx.recurringEvent.findMany({
      where: { vehicleId: id, deletedAt: null },
      select: { templateId: true },
    })
    const activatedTemplateIds = new Set(
      activeEvents.map((e) => e.templateId).filter((t): t is string => t != null),
    )
    const suggestions = (await suggestTemplatesForVehicle(tx, vehicle)).filter(
      (t) => !activatedTemplateIds.has(t.id),
    )

    const costEvents = await tx.eventOccurrence.findMany({
      where: { vehicleId: id, status: 'COMPLETED', actualCost: { not: null } },
      select: {
        id: true,
        completedAt: true,
        actualCost: true,
        currency: true,
        recurringEvent: { select: { name: true, category: true } },
      },
      orderBy: { completedAt: 'desc' },
    })
    const costExpenses = await tx.myVehicleExpense.findMany({
      where: { vehicleId: id, deletedAt: null },
      select: { id: true, item: true, cost: true, date: true },
      orderBy: { date: 'desc' },
    })

    return {
      vehicle,
      open,
      history,
      completedCost,
      expenseCost,
      latestMileage,
      suggestions,
      costEvents,
      costExpenses,
    }
  })

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const {
    vehicle,
    open,
    history,
    completedCost,
    expenseCost,
    latestMileage,
    suggestions,
    costEvents,
    costExpenses,
  } = result
  const num = (d: { toNumber(): number } | null | undefined) => (d ? d.toNumber() : 0)

  const yearStartMs = yearStart.getTime()
  type CostEntry = {
    id: string
    source: 'event' | 'expense'
    title: string
    category: string
    date: Date | null
    amount: number
    currency: string
  }
  const costEntries: CostEntry[] = [
    ...costEvents.map((c) => ({
      id: c.id,
      source: 'event' as const,
      title: c.recurringEvent.name,
      category: c.recurringEvent.category,
      date: c.completedAt,
      amount: num(c.actualCost),
      currency: c.currency ?? 'EUR',
    })),
    ...costExpenses.map((e) => ({
      id: e.id,
      source: 'expense' as const,
      title: e.item,
      category: 'other',
      date: e.date,
      amount: num(e.cost),
      currency: 'EUR',
    })),
  ].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))

  const costAllTime = costEntries.reduce((s, e) => s + e.amount, 0)
  const costThisYearTotal = costEntries
    .filter((e) => e.date && e.date.getTime() >= yearStartMs)
    .reduce((s, e) => s + e.amount, 0)
  const byCategoryMap = new Map<string, number>()
  for (const e of costEntries.filter((x) => x.date && x.date.getTime() >= yearStartMs)) {
    byCategoryMap.set(e.category, (byCategoryMap.get(e.category) ?? 0) + e.amount)
  }
  const costByCategory = [...byCategoryMap.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  return NextResponse.json({
    canModify: session.canModify,
    vehicle: {
      id: vehicle.id,
      registration: vehicle.registration,
      nickname: vehicle.nickname,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      powertrain: vehicle.powertrain,
      country: vehicle.country,
      vin: vehicle.vin,
      note: vehicle.note,
      image: vehicle.image,
    },
    occurrences: open.map((o) => ({
      id: o.id,
      status: o.status,
      dueDate: o.dueDate,
      dueMileage: o.dueMileage,
      overdue: !!o.dueDate && o.dueDate < now && o.status !== 'ARRANGED',
      recurringEvent: o.recurringEvent,
      appointment: o.appointments[0]
        ? {
            scheduledAt: o.appointments[0].scheduledAt,
            provider: o.appointments[0].provider,
          }
        : null,
    })),
    history: history.map((h) => ({
      id: h.id,
      name: h.recurringEvent.name,
      category: h.recurringEvent.category,
      completedAt: h.completedAt,
      completedMileage: h.completedMileage,
      cost: num(h.actualCost),
      currency: h.currency,
    })),
    costThisYear: num(completedCost._sum.actualCost) + num(expenseCost._sum.cost),
    costs: {
      thisYear: costThisYearTotal,
      allTime: costAllTime,
      byCategory: costByCategory,
      entries: costEntries.slice(0, 50),
    },
    latestMileage,
    suggestions: suggestions.map((t) => ({
      id: t.id,
      key: t.key,
      category: t.category,
      kind: t.kind,
      actionType: t.actionType,
    })),
  })
}

const POWERTRAINS = new Set(Object.values(Powertrain))

// PATCH /api/carcare/vehicles/[id] — update the vehicle image (URL already uploaded via
// hono) and/or its editable details.
// Body: { image?, registration?, nickname?, make?, model?, year?, powertrain?, vin?, country? }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { id } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as {
    image?: string | null
    registration?: string
    nickname?: string | null
    make?: string | null
    model?: string | null
    year?: number | null
    powertrain?: string | null
    vin?: string | null
    country?: string | null
  }

  const str = (v: unknown, max: number) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null

  const result = await prisma.$transaction(async (tx) => {
    const vehicle = await tx.myVehicle.findFirst({ where: { id }, select: { id: true } })
    if (!vehicle) return 'not-found'
    if (!(await canModifyVehicle(tx, session.userId, id))) return 'forbidden'

    const data: Record<string, unknown> = {}
    if ('image' in body) data.image = str(body.image, 500)
    if ('registration' in body) {
      const reg = str(body.registration, 20)
      if (reg) data.registration = reg // required — never clear
    }
    if ('nickname' in body) data.nickname = str(body.nickname, 100)
    if ('make' in body) data.make = str(body.make, 60)
    if ('model' in body) data.model = str(body.model, 60)
    if ('vin' in body) data.vin = str(body.vin, 20)
    if ('country' in body) data.country = str(body.country, 2)
    if ('year' in body) {
      const y = typeof body.year === 'number' ? Math.round(body.year) : null
      data.year = y && y >= 1900 && y <= 2100 ? y : null
    }
    if ('powertrain' in body) {
      data.powertrain =
        typeof body.powertrain === 'string' && POWERTRAINS.has(body.powertrain as Powertrain)
          ? (body.powertrain as Powertrain)
          : null
    }

    if (Object.keys(data).length > 0) await tx.myVehicle.update({ where: { id }, data })
    return 'ok'
  })

  if (result === 'not-found') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (result === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/carcare/vehicles/[id] — soft-delete the vehicle and stop its reminders:
// soft-delete its recurring events (so the scheduler ignores them) and cancel any
// still-scheduled deliveries. The vehicle-count trigger recomputes on the update.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { id } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await prisma.$transaction(async (tx) => {
    const vehicle = await tx.myVehicle.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    })
    if (!vehicle) return 'not-found'
    if (!(await canModifyVehicle(tx, session.userId, id))) return 'forbidden'

    const now = new Date()
    const events = await tx.recurringEvent.findMany({
      where: { vehicleId: id },
      select: { id: true },
    })
    const eventIds = events.map((e) => e.id)

    if (eventIds.length > 0) {
      await tx.notificationDelivery.updateMany({
        where: { recurringEventId: { in: eventIds }, status: 'SCHEDULED' },
        data: { status: 'CANCELLED', suppressedReason: 'vehicle deleted' },
      })
      await tx.recurringEvent.updateMany({
        where: { id: { in: eventIds }, deletedAt: null },
        data: { deletedAt: now },
      })
    }
    await tx.myVehicle.update({ where: { id }, data: { deletedAt: now } })
    return 'ok'
  })

  if (result === 'not-found') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (result === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ ok: true })
}
