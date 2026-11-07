import { Prisma } from '@prisma/client'
import { suppressBookingReminders, reactivateBookingReminders } from './scheduler'

export interface BookAppointmentInput {
  providerId?: string | null
  scheduledAt: Date
  bookingReference?: string | null
  estimatedCost?: number | string | null
}

// Books an appointment and moves the occurrence to ARRANGED.
// The appointment's scheduledAt is independent of the occurrence's due date (BR-01):
// this never changes the obligation deadline.
export async function bookAppointment(
  tx: Prisma.TransactionClient,
  occurrenceId: string,
  input: BookAppointmentInput,
) {
  const occ = await tx.eventOccurrence.findUnique({ where: { id: occurrenceId } })
  if (!occ) throw new Error(`occurrence not found: ${occurrenceId}`)
  if (occ.status === 'COMPLETED' || occ.status === 'CANCELLED') {
    throw new Error(`cannot book an appointment on a ${occ.status} occurrence`)
  }

  const appt = await tx.appointment.create({
    data: {
      occurrenceId,
      providerId: input.providerId ?? null,
      scheduledAt: input.scheduledAt,
      status: 'BOOKED',
      bookingReference: input.bookingReference ?? null,
      estimatedCost: input.estimatedCost ?? null,
    },
  })

  await tx.eventOccurrence.update({ where: { id: occurrenceId }, data: { status: 'ARRANGED' } })
  await suppressBookingReminders(tx, occurrenceId) // BR-04
  return appt
}

// Changes only the appointment time. The obligation due date is untouched (BR-01)
// and the occurrence stays ARRANGED.
export async function rescheduleAppointment(
  tx: Prisma.TransactionClient,
  appointmentId: string,
  newScheduledAt: Date,
) {
  const appt = await tx.appointment.findUnique({ where: { id: appointmentId } })
  if (!appt) throw new Error(`appointment not found: ${appointmentId}`)
  if (appt.status !== 'BOOKED') {
    throw new Error(`cannot reschedule a ${appt.status} appointment`)
  }
  return tx.appointment.update({
    where: { id: appointmentId },
    data: { scheduledAt: newScheduledAt },
  })
}

// Cancels the appointment. BR-05: this does NOT cancel the underlying obligation —
// if no booked appointment remains, the occurrence returns to ACTION_REQUIRED so the
// user is reminded to arrange it again. The due date is never changed.
export async function cancelAppointment(tx: Prisma.TransactionClient, appointmentId: string) {
  const appt = await tx.appointment.findUnique({
    where: { id: appointmentId },
    include: { occurrence: true },
  })
  if (!appt) throw new Error(`appointment not found: ${appointmentId}`)
  if (appt.status === 'CANCELLED') return appt

  const updated = await tx.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
  })

  const occ = appt.occurrence
  if (occ.status !== 'COMPLETED' && occ.status !== 'CANCELLED') {
    const remainingBooked = await tx.appointment.count({
      where: { occurrenceId: occ.id, status: 'BOOKED' },
    })
    if (remainingBooked === 0) {
      await tx.eventOccurrence.update({
        where: { id: occ.id },
        data: { status: 'ACTION_REQUIRED' },
      })
      await reactivateBookingReminders(tx, occ.id) // BR-05: obligation still open
    }
  }
  return updated
}
