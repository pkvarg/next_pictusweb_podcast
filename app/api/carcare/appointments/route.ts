import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canModifyVehicle } from '@/lib/carcare/garage'
import { bookAppointment } from '@/lib/carcare/appointments'

// POST /api/carcare/appointments — book an appointment for an occurrence.
// Body: { occurrenceId, providerId?, scheduledAt, bookingReference?, estimatedCost? }
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (!body.occurrenceId || !body.scheduledAt) {
    return NextResponse.json(
      { error: 'occurrenceId and scheduledAt are required' },
      { status: 400 },
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    const occ = await tx.eventOccurrence.findUnique({
      where: { id: body.occurrenceId },
      select: { vehicleId: true },
    })
    if (!occ) return { code: 404 as const }
    if (!(await canModifyVehicle(tx, session.userId, occ.vehicleId))) return { code: 403 as const }
    const appt = await bookAppointment(tx, body.occurrenceId, {
      providerId: body.providerId ?? null,
      scheduledAt: new Date(body.scheduledAt),
      bookingReference: body.bookingReference ?? null,
      estimatedCost: body.estimatedCost ?? null,
    })
    return { code: 201 as const, appointment: appt }
  })

  if (result.code === 404)
    return NextResponse.json({ error: 'Occurrence not found' }, { status: 404 })
  if (result.code === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ appointment: result.appointment }, { status: 201 })
}
