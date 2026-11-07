import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canModifyVehicle } from '@/lib/carcare/garage'
import { cancelAppointment } from '@/lib/carcare/appointments'

// POST /api/carcare/appointments/:id/cancel — cancel an appointment (obligation kept, BR-05).
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const result = await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.findUnique({
      where: { id },
      select: { occurrence: { select: { vehicleId: true } } },
    })
    if (!appt) return { code: 404 as const }
    if (!(await canModifyVehicle(tx, session.userId, appt.occurrence.vehicleId))) {
      return { code: 403 as const }
    }
    const updated = await cancelAppointment(tx, id)
    return { code: 200 as const, appointment: updated }
  })

  if (result.code === 404)
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  if (result.code === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ appointment: result.appointment })
}
