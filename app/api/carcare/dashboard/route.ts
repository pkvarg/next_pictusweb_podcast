import { NextResponse } from 'next/server'
import prisma from '@/db/db'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { listAccessibleVehicleIds } from '@/lib/carcare/garage'

// Action-first dashboard data for the signed-in user's accessible vehicles.
export async function GET() {
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.organizationId) return NextResponse.json({ error: 'No garage' }, { status: 400 })

  const now = new Date()
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))

  const data = await prisma.$transaction(async (tx) => {
    const vehicleIds = await listAccessibleVehicleIds(tx, session.userId, session.organizationId!)
    if (vehicleIds.length === 0) {
      return {
        counts: { needsAttention: 0, upcoming30: 0, arranged: 0, costThisYear: 0 },
        needsAttention: [],
        upcoming: [],
        vehicles: [],
      }
    }

    const occInclude = {
      recurringEvent: {
        select: { id: true, name: true, category: true, kind: true, actionType: true },
      },
      vehicle: {
        select: { id: true, registration: true, nickname: true, make: true, model: true },
      },
      appointments: {
        where: { status: 'BOOKED' as const },
        orderBy: { scheduledAt: 'asc' as const },
        take: 1,
      },
    }

    const open = await tx.eventOccurrence.findMany({
      where: {
        vehicleId: { in: vehicleIds },
        status: { in: ['UPCOMING', 'ACTION_REQUIRED', 'ARRANGED'] },
      },
      include: occInclude,
      orderBy: { dueDate: 'asc' },
    })

    const isOverdue = (o: (typeof open)[number]) =>
      !!o.dueDate && o.dueDate < now && o.status !== 'ARRANGED'
    const needsAttention = open.filter((o) => o.status === 'ACTION_REQUIRED' || isOverdue(o))
    const upcoming = open.filter(
      (o) => o.status === 'UPCOMING' && o.dueDate && o.dueDate >= now && o.dueDate <= in30,
    )
    const arranged = open.filter((o) => o.status === 'ARRANGED')

    const costAgg = await tx.eventOccurrence.aggregate({
      _sum: { actualCost: true },
      where: {
        vehicleId: { in: vehicleIds },
        status: 'COMPLETED',
        completedAt: { gte: yearStart },
      },
    })

    const vehicles = await tx.myVehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: {
        id: true,
        registration: true,
        nickname: true,
        make: true,
        model: true,
        year: true,
        powertrain: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return {
      counts: {
        needsAttention: needsAttention.length,
        upcoming30: upcoming.length,
        arranged: arranged.length,
        costThisYear: Number(costAgg._sum.actualCost ?? 0),
      },
      needsAttention: needsAttention.map((o) => ({ ...o, overdue: isOverdue(o) })),
      upcoming,
      vehicles,
    }
  })

  return NextResponse.json({ ...data, canModify: session.canModify })
}
