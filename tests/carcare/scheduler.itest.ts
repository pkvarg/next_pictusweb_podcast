import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import { planDeliveries, listInAppNotifications } from '@/lib/carcare/scheduler'
import { bookAppointment, cancelAppointment } from '@/lib/carcare/appointments'

let organizationId: string
let userId: string
let vehicleId: string
let recurringEventId: string
let ruleId: string
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
      name: 'ITEST SCHED',
      category: 'inspection',
      recurrenceType: 'FIXED_INTERVAL',
      intervalMonths: 24,
      responsibleUserId: userId,
    },
  })
  recurringEventId = def.id

  const rule = await prisma.notificationRule.create({
    data: {
      organizationId,
      recurringEventId: null,
      stage: 'BOOKING',
      leadDays: 14,
      channels: ['IN_APP'],
    },
  })
  ruleId = rule.id
})

afterAll(async () => {
  try {
    await prisma.notificationDelivery.deleteMany({ where: { recurringEventId } })
    await prisma.appointment.deleteMany({ where: { occurrence: { recurringEventId } } })
    await prisma.eventOccurrence.deleteMany({ where: { recurringEventId } })
    await prisma.notificationRule.deleteMany({ where: { id: ruleId } })
    await prisma.recurringEvent.deleteMany({ where: { id: recurringEventId } })
    await prisma.myVehicle.deleteMany({ where: { id: vehicleId } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('scheduler — planner & booking suppression', () => {
  it('plans a BOOKING reminder from the rule, anchored leadDays before the due date; idempotent', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id)) // re-run must not double-create

    const deliveries = await prisma.notificationDelivery.findMany({
      where: { occurrenceId: occ.id },
    })
    expect(deliveries).toHaveLength(1)
    expect(deliveries[0].stage).toBe('BOOKING')
    expect(deliveries[0].channel).toBe('IN_APP')
    expect(deliveries[0].status).toBe('SCHEDULED')
    expect(deliveries[0].scheduledFor.toISOString()).toBe('2026-01-23T00:00:00.000Z') // 14 days before DUE
  })

  it('T7: booking an appointment suppresses the booking reminder', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date('2026-01-25T09:00:00Z') }),
    )
    const d = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, stage: 'BOOKING' },
    })
    expect(d?.status).toBe('SUPPRESSED')
    expect(d?.suppressedReason).toBe('appointment booked')
  })

  it('T8: cancelling the appointment reactivates the booking reminder', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    const appt = await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date('2026-01-25T09:00:00Z') }),
    )
    await prisma.$transaction((tx) => cancelAppointment(tx, appt.id))
    const d = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, stage: 'BOOKING' },
    })
    expect(d?.status).toBe('SCHEDULED')
    expect(d?.suppressedReason).toBeNull()
  })

  it('in-app notification centre lists the scheduled IN_APP reminders for the user', async () => {
    const list = await prisma.$transaction((tx) => listInAppNotifications(tx, userId))
    expect(list.every((d) => d.channel === 'IN_APP')).toBe(true)
    expect(list.some((d) => d.recurringEventId === recurringEventId)).toBe(true)
  })
})
