import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canModifyVehicle } from '@/lib/carcare/garage'
import { createCustomEvent, type CustomEventInput } from '@/lib/carcare/events'

// POST /api/carcare/events  — create a custom (non-template) event
// Body: { vehicleId, name, category, recurrenceType, interval*, seasonal*, dueDate?, ... }
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (!body.vehicleId || !body.name || !body.category || !body.recurrenceType) {
    return NextResponse.json(
      { error: 'vehicleId, name, category and recurrenceType are required' },
      { status: 400 },
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    if (!(await canModifyVehicle(tx, session.userId, body.vehicleId))) return null
    const input: CustomEventInput = {
      name: body.name,
      category: body.category,
      kind: body.kind,
      actionType: body.actionType,
      recurrenceType: body.recurrenceType,
      intervalMonths: body.intervalMonths ?? null,
      intervalDays: body.intervalDays ?? null,
      intervalKm: body.intervalKm ?? null,
      seasonalMonth: body.seasonalMonth ?? null,
      seasonalDay: body.seasonalDay ?? null,
      responsibleUserId: body.responsibleUserId ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      dueMileage: body.dueMileage ?? null,
    }
    return createCustomEvent(tx, body.vehicleId, input)
  })
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json(result, { status: 201 })
}
