import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { listAccessibleVehicleIds } from '@/lib/carcare/garage'

// GET /api/carcare/occurrences?vehicleId=&status=&includeCompleted=
// Occurrences across the user's accessible vehicles (for the events list + calendar).
export async function GET(request: NextRequest) {
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const vehicleFilter = url.searchParams.get('vehicleId')
  const statusFilter = url.searchParams.get('status')
  const includeCompleted = url.searchParams.get('includeCompleted') === 'true'

  const occurrences = await prisma.$transaction(async (tx) => {
    let ids = await listAccessibleVehicleIds(tx, session.userId, session.organizationId!)
    if (vehicleFilter) ids = ids.filter((id) => id === vehicleFilter)
    if (ids.length === 0) return []

    const openStatuses = ['UPCOMING', 'ACTION_REQUIRED', 'ARRANGED'] as const
    const where: Record<string, unknown> = { vehicleId: { in: ids } }
    if (statusFilter) where.status = statusFilter
    else if (!includeCompleted) where.status = { in: openStatuses }

    return tx.eventOccurrence.findMany({
      where,
      include: {
        recurringEvent: {
          select: { id: true, name: true, category: true, kind: true, actionType: true },
        },
        vehicle: {
          select: { id: true, registration: true, nickname: true, make: true, model: true },
        },
        appointments: { where: { status: 'BOOKED' }, orderBy: { scheduledAt: 'asc' }, take: 1 },
      },
      // No-date events (freshly added from suggestions) sort to the TOP so they're visible
      // and the user is nudged to set a date — not buried below every dated event.
      orderBy: { dueDate: { sort: 'asc', nulls: 'first' } },
      take: 500,
    })
  })

  const now = Date.now()
  const withOverdue = occurrences.map((o) => ({
    ...o,
    overdue:
      !!o.dueDate &&
      o.dueDate.getTime() < now &&
      o.status !== 'ARRANGED' &&
      o.status !== 'COMPLETED',
  }))
  return NextResponse.json({ occurrences: withOverdue, canModify: session.canModify })
}
