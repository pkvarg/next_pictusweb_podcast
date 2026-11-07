import { NextResponse } from 'next/server'
import prisma from '@/db/db'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canAccessVehicle } from '@/lib/carcare/garage'
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

    return { vehicle, open, history, completedCost, expenseCost, latestMileage, suggestions }
  })

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { vehicle, open, history, completedCost, expenseCost, latestMileage, suggestions } = result
  const num = (d: { toNumber(): number } | null | undefined) => (d ? d.toNumber() : 0)

  return NextResponse.json({
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
