import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canModifyVehicle, listAccessibleVehicleIds } from '@/lib/carcare/garage'

// GET /api/carcare/costs
// Spend across the user's accessible vehicles: completed-event costs + logged
// expenses, with this-year / all-time totals and by-vehicle / by-category breakdowns.
export async function GET() {
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))

  const payload = await prisma.$transaction(async (tx) => {
    const ids = await listAccessibleVehicleIds(tx, session.userId, session.organizationId!)
    if (ids.length === 0) {
      return { totals: { thisYear: 0, allTime: 0 }, byVehicle: [], byCategory: [], entries: [] }
    }

    const vehicles = await tx.myVehicle.findMany({
      where: { id: { in: ids } },
      select: { id: true, registration: true, nickname: true, make: true, model: true },
    })
    const vehicleById = new Map(vehicles.map((v) => [v.id, v]))
    const vehicleLabel = (id: string) => {
      const v = vehicleById.get(id)
      if (!v) return { id, name: '—', registration: '' }
      return {
        id,
        name: v.nickname || [v.make, v.model].filter(Boolean).join(' ') || v.registration,
        registration: v.registration,
      }
    }

    const completed = await tx.eventOccurrence.findMany({
      where: { vehicleId: { in: ids }, status: 'COMPLETED', actualCost: { not: null } },
      select: {
        id: true,
        vehicleId: true,
        completedAt: true,
        actualCost: true,
        currency: true,
        recurringEvent: { select: { name: true, category: true } },
      },
    })

    const expenses = await tx.myVehicleExpense.findMany({
      where: { vehicleId: { in: ids }, deletedAt: null },
      select: { id: true, vehicleId: true, item: true, cost: true, date: true },
    })

    type Entry = {
      id: string
      source: 'event' | 'expense'
      title: string
      category: string
      date: Date
      amount: number
      currency: string
      vehicle: { id: string; name: string; registration: string }
    }

    const entries: Entry[] = []
    for (const c of completed) {
      if (!c.completedAt) continue
      entries.push({
        id: c.id,
        source: 'event',
        title: c.recurringEvent.name,
        category: c.recurringEvent.category,
        date: c.completedAt,
        amount: c.actualCost ? c.actualCost.toNumber() : 0,
        currency: c.currency ?? 'EUR',
        vehicle: vehicleLabel(c.vehicleId),
      })
    }
    for (const e of expenses) {
      entries.push({
        id: e.id,
        source: 'expense',
        title: e.item,
        category: 'other',
        date: e.date,
        amount: e.cost.toNumber(),
        currency: 'EUR',
        vehicle: vehicleLabel(e.vehicleId),
      })
    }

    entries.sort((a, b) => b.date.getTime() - a.date.getTime())

    const allTime = entries.reduce((s, e) => s + e.amount, 0)
    const thisYear = entries.filter((e) => e.date >= yearStart).reduce((s, e) => s + e.amount, 0)

    const byVehicleMap = new Map<string, number>()
    const byCategoryMap = new Map<string, number>()
    for (const e of entries.filter((x) => x.date >= yearStart)) {
      byVehicleMap.set(e.vehicle.id, (byVehicleMap.get(e.vehicle.id) ?? 0) + e.amount)
      byCategoryMap.set(e.category, (byCategoryMap.get(e.category) ?? 0) + e.amount)
    }

    const byVehicle = [...byVehicleMap.entries()]
      .map(([id, total]) => ({ ...vehicleLabel(id), total }))
      .sort((a, b) => b.total - a.total)
    const byCategory = [...byCategoryMap.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)

    return {
      totals: { thisYear, allTime },
      byVehicle,
      byCategory,
      entries: entries.slice(0, 100).map((e) => ({
        id: e.id,
        source: e.source,
        title: e.title,
        category: e.category,
        date: e.date,
        amount: e.amount,
        currency: e.currency,
        vehicle: e.vehicle,
      })),
    }
  })

  return NextResponse.json(payload)
}

// POST /api/carcare/costs — log an expense against a vehicle
// Body: { vehicleId, item, cost, date?, note? }
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const cost = Number(body.cost)
  if (!body.vehicleId || !body.item || !Number.isFinite(cost) || cost < 0) {
    return NextResponse.json(
      { error: 'vehicleId, item and a non-negative cost are required' },
      { status: 400 },
    )
  }

  const id = await prisma.$transaction(async (tx) => {
    if (!(await canModifyVehicle(tx, session.userId, body.vehicleId))) return null
    const created = await tx.myVehicleExpense.create({
      data: {
        vehicleId: body.vehicleId,
        organizationId: session.organizationId!,
        userId: session.userId,
        item: String(body.item).slice(0, 200),
        cost,
        date: body.date ? new Date(body.date) : new Date(),
        note: body.note ? String(body.note).slice(0, 500) : null,
      },
      select: { id: true },
    })
    return created.id
  })

  if (!id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ id }, { status: 201 })
}
