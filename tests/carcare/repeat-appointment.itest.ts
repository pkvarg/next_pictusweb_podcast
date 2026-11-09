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
const DUE = new Date('2026-02-06T00:00:00Z')

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
    // base 2026-01-23, +3d steps, stop at/after due 2026-02-06 => 5 instances
    expect(deliveries).toHaveLength(5)
    expect(deliveries.map((d) => d.scheduledFor.toISOString())).toEqual([
      '2026-01-23T07:30:00.000Z',
      '2026-01-26T07:30:00.000Z',
      '2026-01-29T07:30:00.000Z',
      '2026-02-01T07:30:00.000Z',
      '2026-02-04T07:30:00.000Z',
    ])
    expect(deliveries.every((d) => d.status === 'SCHEDULED')).toBe(true)
  })

  it('booking suppresses the whole BOOKING series and re-planning never resurrects it', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date('2026-01-25T09:00:00Z') }),
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
  it('booking schedules an APPOINTMENT reminder leadDays before the visit', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date('2026-01-25T09:00:00Z') }),
    )
    const appt = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, stage: 'APPOINTMENT' },
    })
    // 1 day before the visit day (2026-01-24), at the 08:30 Bratislava send time (07:30 UTC)
    expect(appt?.status).toBe('SCHEDULED')
    expect(appt?.scheduledFor.toISOString()).toBe('2026-01-24T07:30:00.000Z')
  })

  it('rescheduling moves the APPOINTMENT reminder; cancelling drops it', async () => {
    const occ = await freshOccurrence()
    const booked = await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date('2026-01-25T09:00:00Z') }),
    )
    await prisma.$transaction((tx) =>
      rescheduleAppointment(tx, booked.id, new Date('2026-01-28T09:00:00Z')),
    )
    const moved = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, stage: 'APPOINTMENT' },
    })
    expect(moved?.status).toBe('SCHEDULED')
    expect(moved?.scheduledFor.toISOString()).toBe('2026-01-27T07:30:00.000Z')

    await prisma.$transaction((tx) => cancelAppointment(tx, booked.id))
    const dropped = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, stage: 'APPOINTMENT' },
    })
    expect(dropped?.status).toBe('SUPPRESSED')
    expect(dropped?.suppressedReason).toBe('appointment cancelled')
  })
})
