import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import { planDeliveries } from '@/lib/carcare/scheduler'
import {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from '@/lib/carcare/appointments'

let organizationId: string
let userId: string
let vehicleId: string
let recurringEventId: string

const DAY = 86_400_000
function midnightUTC(ms: number): Date {
  const d = new Date(ms)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}
// Future due date so the repeating series lands ahead of "now" (the planner never
// backfills past repeat instances).
const DUE = midnightUTC(Date.now() + 40 * DAY)

async function freshOccurrence() {
  return prisma.eventOccurrence.create({
    data: {
      recurringEventId,
      vehicleId,
      sequenceNo: Date.now() % 1000000,
      status: 'ACTION_REQUIRED',
      dueDate: DUE,
    },
  })
}

beforeAll(async () => {
  const user = await prisma.user.findFirst({ where: { organizationId: { not: null } } })
  if (!user?.organizationId) throw new Error('no user with an organization in the dev DB')
  organizationId = user.organizationId
  userId = user.id

  const vehicle = await prisma.myVehicle.create({
    data: { organizationId, userId, type: 'ITEST', registration: `IT-${Date.now() % 100000000}` },
  })
  vehicleId = vehicle.id

  const def = await prisma.recurringEvent.create({
    data: {
      organizationId,
      vehicleId,
      name: 'ITEST REPEAT+APPT',
      category: 'inspection',
      recurrenceType: 'FIXED_INTERVAL',
      intervalMonths: 24,
      responsibleUserId: userId,
    },
  })
  recurringEventId = def.id

  // Event-specific rules so this file never collides with shared org-wide defaults.
  await prisma.notificationRule.createMany({
    data: [
      {
        organizationId,
        recurringEventId,
        stage: 'BOOKING',
        leadDays: 14,
        channels: ['IN_APP'],
        repeatUntilActioned: true,
        repeatEveryDays: 3,
      },
      { organizationId, recurringEventId, stage: 'APPOINTMENT', leadDays: 1, channels: ['IN_APP'] },
    ],
  })
})

afterAll(async () => {
  try {
    await prisma.notificationDelivery.deleteMany({ where: { recurringEventId } })
    await prisma.appointment.deleteMany({ where: { occurrence: { recurringEventId } } })
    await prisma.eventOccurrence.deleteMany({ where: { recurringEventId } })
    await prisma.notificationRule.deleteMany({ where: { recurringEventId } })
    await prisma.recurringEvent.deleteMany({ where: { id: recurringEventId } })
    await prisma.myVehicle.deleteMany({ where: { id: vehicleId } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('repeat-until-actioned', () => {
  it('plans a repeating BOOKING series every 3 days up to the due date; idempotent', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id)) // re-run must not double-create

    const deliveries = await prisma.notificationDelivery.findMany({
      where: { occurrenceId: occ.id, stage: 'BOOKING' },
      orderBy: { scheduledFor: 'asc' },
    })
    // base = due-14, +3d steps, stop at/after the due date => 5 instances
    expect(deliveries).toHaveLength(5)
    expect(deliveries.every((d) => d.status === 'SCHEDULED')).toBe(true)
    // all in the future and strictly 3 days apart
    const times = deliveries.map((d) => d.scheduledFor.getTime())
    expect(times.every((t) => t > Date.now())).toBe(true)
    for (let i = 1; i < times.length; i++) {
      expect(times[i] - times[i - 1]).toBe(3 * DAY)
    }
  })

  it('does not backfill past repeat instances', async () => {
    // Due in the past: the whole BOOKING series is historical, so only the primary
    // (i=0) reminder is kept, never a catch-up burst of the repeats.
    const occ = await prisma.eventOccurrence.create({
      data: {
        recurringEventId,
        vehicleId,
        sequenceNo: Date.now() % 1000000,
        status: 'ACTION_REQUIRED',
        dueDate: midnightUTC(Date.now() - 5 * DAY),
      },
    })
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    const booking = await prisma.notificationDelivery.findMany({
      where: { occurrenceId: occ.id, stage: 'BOOKING' },
    })
    expect(booking).toHaveLength(1)
  })

  it('booking suppresses the whole BOOKING series and re-planning never resurrects it', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date(DUE.getTime() - 5 * DAY) }),
    )
    // tick runs the planner again for the now-ARRANGED occurrence
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))

    const booking = await prisma.notificationDelivery.findMany({
      where: { occurrenceId: occ.id, stage: 'BOOKING' },
    })
    expect(booking).toHaveLength(5)
    expect(booking.every((d) => d.status === 'SUPPRESSED')).toBe(true)
  })
})

describe('appointment reminder', () => {
  it('booking schedules an APPOINTMENT reminder one day before the visit', async () => {
    const occ = await freshOccurrence()
    const visit = new Date(DUE.getTime() - 5 * DAY)
    await prisma.$transaction((tx) => bookAppointment(tx, occ.id, { scheduledAt: visit }))
    const appt = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, stage: 'APPOINTMENT' },
    })
    expect(appt?.status).toBe('SCHEDULED')
    // on the calendar day before the visit
    const expectedDay = midnightUTC(visit.getTime() - 1 * DAY).getTime()
    expect(midnightUTC(appt!.scheduledFor.getTime()).getTime()).toBe(expectedDay)
  })

  it('rescheduling moves the APPOINTMENT reminder; cancelling drops it', async () => {
    const occ = await freshOccurrence()
    const booked = await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date(DUE.getTime() - 8 * DAY) }),
    )
    const newVisit = new Date(DUE.getTime() - 3 * DAY)
    await prisma.$transaction((tx) => rescheduleAppointment(tx, booked.id, newVisit))
    const moved = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, stage: 'APPOINTMENT' },
    })
    expect(moved?.status).toBe('SCHEDULED')
    expect(midnightUTC(moved!.scheduledFor.getTime()).getTime()).toBe(
      midnightUTC(newVisit.getTime() - 1 * DAY).getTime(),
    )

    await prisma.$transaction((tx) => cancelAppointment(tx, booked.id))
    const dropped = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, stage: 'APPOINTMENT' },
    })
    expect(dropped?.status).toBe('SUPPRESSED')
    expect(dropped?.suppressedReason).toBe('appointment cancelled')
  })
})
