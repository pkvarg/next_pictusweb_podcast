import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import { planDeliveries, reassignResponsibleUser } from '@/lib/carcare/scheduler'
import { completeOccurrence } from '@/lib/carcare/completion'

let organizationId: string
let userAId: string
let userBId: string
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
  const org = await prisma.organization.findFirst({ select: { id: true } })
  if (!org) throw new Error('no organization in dev DB')
  organizationId = org.id
  const base = { role: 'CLIENT' as const, organizationId, channelOptIns: ['IN_APP'] as const }
  const a = await prisma.user.create({
    data: { email: `itest-lcA-${Date.now()}@example.com`, ...base },
  })
  const b = await prisma.user.create({
    data: { email: `itest-lcB-${Date.now()}@example.com`, ...base },
  })
  userAId = a.id
  userBId = b.id
  const vehicle = await prisma.myVehicle.create({
    data: {
      organizationId,
      userId: userAId,
      type: 'ITEST',
      registration: `IT-${Date.now() % 100000000}`,
    },
  })
  vehicleId = vehicle.id
  const def = await prisma.recurringEvent.create({
    data: {
      organizationId,
      vehicleId,
      name: 'ITEST LC',
      category: 'inspection',
      recurrenceType: 'FIXED_INTERVAL',
      intervalMonths: 24,
      responsibleUserId: userAId,
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
    await prisma.eventOccurrence.deleteMany({ where: { recurringEventId } })
    await prisma.notificationRule.deleteMany({ where: { id: ruleId } })
    await prisma.recurringEvent.deleteMany({ where: { id: recurringEventId } })
    await prisma.myVehicle.deleteMany({ where: { id: vehicleId } })
    await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId] } } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('lifecycle suppression & reassignment', () => {
  it('T9: completing an occurrence suppresses its remaining scheduled reminders', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    const before = await prisma.notificationDelivery.findMany({ where: { occurrenceId: occ.id } })
    expect(before.length).toBeGreaterThan(0)

    await prisma.$transaction((tx) =>
      completeOccurrence(tx, occ.id, { date: new Date('2026-02-01T00:00:00Z'), cost: 50 }),
    )
    const after = await prisma.notificationDelivery.findMany({ where: { occurrenceId: occ.id } })
    expect(after.every((d) => d.status === 'SUPPRESSED')).toBe(true)
    expect(after.every((d) => d.suppressedReason === 'event completed')).toBe(true)
  })

  it('T10: reassigning responsibility re-targets future reminders', async () => {
    const occ = await freshOccurrence()
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))

    await prisma.$transaction((tx) => reassignResponsibleUser(tx, recurringEventId, userBId))

    const forA = await prisma.notificationDelivery.findMany({
      where: { occurrenceId: occ.id, recipientUserId: userAId, status: 'SCHEDULED' },
    })
    const forB = await prisma.notificationDelivery.findMany({
      where: { occurrenceId: occ.id, recipientUserId: userBId, status: 'SCHEDULED' },
    })
    expect(forA).toHaveLength(0) // old responsible user no longer gets reminders
    expect(forB.length).toBeGreaterThan(0) // new responsible user does
  })
})
