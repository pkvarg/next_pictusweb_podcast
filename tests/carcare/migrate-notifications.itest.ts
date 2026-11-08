import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import { migrateVehicleNotifications } from '@/lib/carcare/migrateNotifications'

let organizationId: string
let userId: string
let tag: string
let regA: string
let regB: string
let regC: string

beforeAll(async () => {
  const org = await prisma.organization.findFirst({ select: { id: true } })
  if (!org) throw new Error('no organization in dev DB')
  organizationId = org.id
  userId = (
    await prisma.user.create({
      data: { email: `itest-mig-${Date.now()}@example.com`, role: 'CLIENT', organizationId },
    })
  ).id

  tag = `MIG${Date.now() % 1000000}`
  regA = `${tag}A`
  regB = `${tag}B`
  regC = `${tag}C`

  const note = (vehicleRegistration: string, notificationType: string, dutyDate: Date) =>
    prisma.vehicleNotification.create({
      data: { organizationId, userId, vehicleRegistration, notificationType, dutyDate },
    })

  await note(regA, 'STK/EK', new Date('2024-01-01'))
  await note(regA, 'STK/EK', new Date('2023-06-01')) // dedup: same vehicle+type
  await note(regA, 'Výmena oleja', new Date('2024-03-01'))
  await note(regB, 'Poistenie', new Date('2027-01-15')) // future -> kept as-is
  await note(regC, 'test linku', new Date('2024-01-01')) // skipped type -> no vehicle
})

afterAll(async () => {
  await prisma.myVehicle.deleteMany({
    where: { organizationId, registration: { in: [regA, regB, regC] } },
  })
  await prisma.vehicleNotification.deleteMany({
    where: { vehicleRegistration: { in: [regA, regB, regC] } },
  })
  await prisma.user.deleteMany({ where: { id: userId } })
})

const vehicleByReg = (registration: string) =>
  prisma.myVehicle.findFirst({ where: { organizationId, registration } })

describe('migrateVehicleNotifications', () => {
  it('creates vehicles, classifies events, dedups, and skips test rows', async () => {
    await migrateVehicleNotifications(prisma, { dryRun: false })

    const a = await vehicleByReg(regA)
    const b = await vehicleByReg(regB)
    const c = await vehicleByReg(regC)
    expect(a).toBeTruthy()
    expect(b).toBeTruthy()
    expect(c).toBeNull() // only a skipped type -> no vehicle

    const aEvents = await prisma.recurringEvent.findMany({
      where: { vehicleId: a!.id },
      orderBy: { name: 'asc' },
    })
    expect(aEvents.map((e) => e.name)).toEqual(['STK/EK', 'Výmena oleja']) // STK/EK deduped to one

    const stk = aEvents.find((e) => e.name === 'STK/EK')!
    expect(stk.category).toBe('inspection')
    expect(stk.kind).toBe('LEGAL')
    expect(stk.recurrenceType).toBe('FIXED_INTERVAL')
    expect(stk.intervalMonths).toBe(24)

    const stkOcc = await prisma.eventOccurrence.findFirst({ where: { recurringEventId: stk.id } })
    expect(stkOcc?.status).toBe('UPCOMING')
    expect(stkOcc?.dueDate && stkOcc.dueDate.getTime()).toBeGreaterThan(Date.now()) // rolled forward

    const bEvents = await prisma.recurringEvent.findMany({ where: { vehicleId: b!.id } })
    expect(bEvents).toHaveLength(1)
    expect(bEvents[0].name).toBe('PZP – povinné zmluvné poistenie')
    expect(bEvents[0].category).toBe('insurance')
    expect(bEvents[0].kind).toBe('LEGAL')
  })

  it('is idempotent on re-run (no duplicate events)', async () => {
    const a = await vehicleByReg(regA)
    const before = await prisma.recurringEvent.count({ where: { vehicleId: a!.id } })
    await migrateVehicleNotifications(prisma, { dryRun: false })
    const after = await prisma.recurringEvent.count({ where: { vehicleId: a!.id } })
    expect(after).toBe(before)
  })
})
