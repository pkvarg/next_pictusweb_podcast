import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import { activateTemplate, createCustomEvent } from '@/lib/carcare/events'
import { suggestTemplatesForVehicle } from '@/lib/carcare/vehicles'

let organizationId: string
let userId: string
let vehicleId: string

beforeAll(async () => {
  const user = await prisma.user.findFirst({ where: { organizationId: { not: null } } })
  if (!user?.organizationId) throw new Error('no user with an organization in the dev DB')
  organizationId = user.organizationId
  userId = user.id
  const vehicle = await prisma.myVehicle.create({
    data: {
      organizationId,
      userId,
      type: 'ITEST',
      registration: `IT-${Date.now() % 100000000}`,
      powertrain: 'DIESEL',
      country: 'SK',
    },
  })
  vehicleId = vehicle.id
})

afterAll(async () => {
  try {
    await prisma.eventOccurrence.deleteMany({ where: { vehicleId } })
    await prisma.recurringEvent.deleteMany({ where: { vehicleId } })
    await prisma.myVehicle.deleteMany({ where: { id: vehicleId } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('event catalogue & templates', () => {
  it('the Slovak templates are seeded', async () => {
    const keys = (await prisma.eventTemplate.findMany({ select: { key: true } })).map((t) => t.key)
    for (const k of ['stk', 'ek', 'pzp', 'winter_tyres', 'regular_service', 'highway_vignette']) {
      expect(keys).toContain(k)
    }
  })

  it('suggests SK legal templates for a SK diesel; excludes EK for a BEV', async () => {
    const diesel = (
      await prisma.$transaction((tx) =>
        suggestTemplatesForVehicle(tx, { powertrain: 'DIESEL', country: 'SK' }),
      )
    ).map((t) => t.key)
    expect(diesel).toEqual(expect.arrayContaining(['stk', 'ek', 'pzp']))

    const bev = (
      await prisma.$transaction((tx) =>
        suggestTemplatesForVehicle(tx, { powertrain: 'BEV', country: 'SK' }),
      )
    ).map((t) => t.key)
    expect(bev).toContain('stk') // STK applies to all
    expect(bev).not.toContain('ek') // emissions check N/A for BEV
    expect(bev).toContain('battery_warranty') // BEV-specific
  })

  it('activates a template into a recurring event + first occurrence; idempotent', async () => {
    const r1 = await prisma.$transaction((tx) =>
      activateTemplate(tx, {
        vehicleId,
        templateKey: 'stk',
        dueDate: new Date('2026-02-06T00:00:00Z'),
        responsibleUserId: userId,
      }),
    )
    expect(r1.created).toBe(true)
    expect(r1.event.templateId).not.toBeNull()
    expect(r1.event.recurrenceType).toBe('FIXED_INTERVAL')
    expect(r1.occurrence?.sequenceNo).toBe(1)

    const r2 = await prisma.$transaction((tx) =>
      activateTemplate(tx, {
        vehicleId,
        templateKey: 'stk',
        dueDate: new Date('2026-02-06T00:00:00Z'),
      }),
    )
    expect(r2.created).toBe(false) // no duplicate activation
    const count = await prisma.recurringEvent.count({
      where: { vehicleId, template: { key: 'stk' } },
    })
    expect(count).toBe(1)
  })

  it('creates a custom event with no template', async () => {
    const { event, occurrence } = await prisma.$transaction((tx) =>
      createCustomEvent(tx, vehicleId, {
        name: 'Car wash',
        category: 'cleaning',
        recurrenceType: 'FIXED_INTERVAL',
        intervalDays: 14,
        dueDate: new Date('2026-01-20T00:00:00Z'),
      }),
    )
    expect(event.templateId).toBeNull()
    expect(event.actionType).toBe('CUSTOM')
    expect(occurrence.sequenceNo).toBe(1)
  })
})
