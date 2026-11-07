import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import { createVehicle, searchCatalogue, suggestTemplatesForVehicle } from '@/lib/carcare/vehicles'

let organizationId: string
let userId: string
const vehicleIds: string[] = []
const templateKeys = ['itest_universal', 'itest_bev_only', 'itest_sk_only']

beforeAll(async () => {
  const user = await prisma.user.findFirst({ where: { organizationId: { not: null } } })
  if (!user?.organizationId) throw new Error('no user with an organization in the dev DB')
  organizationId = user.organizationId
  userId = user.id

  await prisma.eventTemplate.createMany({
    data: [
      {
        key: 'itest_universal',
        category: 'service',
        powertrains: [],
        recurrenceType: 'FIXED_INTERVAL',
        intervalMonths: 12,
      },
      {
        key: 'itest_bev_only',
        category: 'battery',
        powertrains: ['BEV'],
        recurrenceType: 'FIXED_INTERVAL',
        intervalMonths: 24,
      },
      {
        key: 'itest_sk_only',
        category: 'inspection',
        country: 'SK',
        powertrains: [],
        recurrenceType: 'FIXED_INTERVAL',
        intervalMonths: 24,
      },
    ],
  })
})

afterAll(async () => {
  try {
    await prisma.myVehicle.deleteMany({ where: { id: { in: vehicleIds } } })
    await prisma.eventTemplate.deleteMany({ where: { key: { in: templateKeys } } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('vehicles & catalogue', () => {
  it('searches the make/model catalogue (substring, case-insensitive)', async () => {
    const r = await prisma.$transaction((tx) => searchCatalogue(tx, 'octav'))
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((e) => /octavia/i.test(e.model))).toBe(true)
  })

  it('creates a vehicle with structured fields', async () => {
    const v = await prisma.$transaction((tx) =>
      createVehicle(tx, organizationId, userId, {
        registration: `IT-${Date.now() % 100000000}`,
        nickname: 'Family car',
        make: 'Škoda',
        model: 'Octavia',
        powertrain: 'DIESEL',
        country: 'SK',
        vin: 'TMBJG7NE5K0123456',
        year: 2019,
      }),
    )
    vehicleIds.push(v.id)
    expect(v.make).toBe('Škoda')
    expect(v.powertrain).toBe('DIESEL')
    expect(v.country).toBe('SK')
    expect(v.vin).toBe('TMBJG7NE5K0123456')
    expect(v.type).toBe('Škoda Octavia') // derived when type not given
  })

  it('suggests templates by powertrain and country', async () => {
    const forDieselSk = await prisma.$transaction((tx) =>
      suggestTemplatesForVehicle(tx, { powertrain: 'DIESEL', country: 'SK' }),
    )
    const keys = forDieselSk.map((t) => t.key)
    expect(keys).toContain('itest_universal') // universal
    expect(keys).toContain('itest_sk_only') // SK match
    expect(keys).not.toContain('itest_bev_only') // wrong powertrain

    const forBevNoCountry = await prisma.$transaction((tx) =>
      suggestTemplatesForVehicle(tx, { powertrain: 'BEV', country: null }),
    )
    const keys2 = forBevNoCountry.map((t) => t.key)
    expect(keys2).toContain('itest_universal')
    expect(keys2).toContain('itest_bev_only') // BEV match
    expect(keys2).not.toContain('itest_sk_only') // no country -> SK-only excluded
  })
})
