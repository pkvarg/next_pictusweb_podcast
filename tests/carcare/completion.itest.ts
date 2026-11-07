import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import { completeOccurrence } from '@/lib/carcare/completion'

let vehicleId: string
let recurringEventId: string
let occurrenceId: string

beforeAll(async () => {
  const user = await prisma.user.findFirst({ where: { organizationId: { not: null } } })
  if (!user?.organizationId) throw new Error('no user with an organization in the dev DB')

  const vehicle = await prisma.myVehicle.create({
    data: {
      organizationId: user.organizationId,
      userId: user.id,
      type: 'ITEST',
      registration: `ITEST-${Date.now()}`,
    },
  })
  vehicleId = vehicle.id

  const def = await prisma.recurringEvent.create({
    data: {
      organizationId: user.organizationId,
      vehicleId,
      name: 'ITEST STK',
      category: 'inspection',
      actionType: 'INSPECT',
      recurrenceType: 'FIXED_INTERVAL',
      intervalMonths: 24,
    },
  })
  recurringEventId = def.id

  const occ = await prisma.eventOccurrence.create({
    data: {
      recurringEventId,
      vehicleId,
      sequenceNo: 1,
      status: 'ACTION_REQUIRED',
      dueDate: new Date('2026-02-06T00:00:00Z'),
    },
  })
  occurrenceId = occ.id
})

afterAll(async () => {
  try {
    await prisma.eventOccurrence.deleteMany({ where: { recurringEventId } })
    await prisma.recurringEvent.deleteMany({ where: { id: recurringEventId } })
    await prisma.myVehicle.deleteMany({ where: { id: vehicleId } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('completeOccurrence (T1 — idempotent completion)', () => {
  it('completes the occurrence and records the outcome', async () => {
    await prisma.$transaction((tx) =>
      completeOccurrence(tx, occurrenceId, {
        date: new Date('2026-03-18T00:00:00Z'),
        mileage: 128430,
        cost: 65,
        currency: 'EUR',
      }),
    )
    const occ = await prisma.eventOccurrence.findUnique({ where: { id: occurrenceId } })
    expect(occ?.status).toBe('COMPLETED')
    expect(occ?.completedMileage).toBe(128430)
    expect(occ?.actualCost?.toString()).toBe('65')
  })

  it('generates exactly one successor, anchored on the due date (no drift)', async () => {
    const successors = await prisma.eventOccurrence.findMany({
      where: { recurringEventId, sequenceNo: 2 },
    })
    expect(successors).toHaveLength(1)
    expect(successors[0].generatedFromId).toBe(occurrenceId)
    expect(successors[0].status).toBe('UPCOMING')
    expect(successors[0].dueDate?.toISOString()).toBe('2028-02-06T00:00:00.000Z')
  })

  it('is safe on a duplicate submission — still exactly one successor', async () => {
    await prisma.$transaction((tx) =>
      completeOccurrence(tx, occurrenceId, {
        date: new Date('2026-03-18T00:00:00Z'),
        mileage: 128430,
        cost: 65,
        currency: 'EUR',
      }),
    )
    const all = await prisma.eventOccurrence.findMany({ where: { recurringEventId } })
    expect(all).toHaveLength(2) // the original + exactly one successor
  })
})
