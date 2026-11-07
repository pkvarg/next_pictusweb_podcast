import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from '@/lib/carcare/appointments'
import { createProvider, archiveProvider, listProviders } from '@/lib/carcare/providers'

let organizationId: string
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
  const vehicle = await prisma.myVehicle.create({
    data: {
      organizationId,
      userId: user.id,
      type: 'ITEST',
      registration: `IT-${Date.now() % 100000000}`,
    },
  })
  vehicleId = vehicle.id
  const def = await prisma.recurringEvent.create({
    data: {
      organizationId,
      vehicleId,
      name: 'ITEST APPT',
      category: 'inspection',
      recurrenceType: 'FIXED_INTERVAL',
      intervalMonths: 24,
    },
  })
  recurringEventId = def.id
})

afterAll(async () => {
  try {
    await prisma.appointment.deleteMany({ where: { occurrence: { recurringEventId } } })
    await prisma.eventOccurrence.deleteMany({ where: { recurringEventId } })
    await prisma.recurringEvent.deleteMany({ where: { id: recurringEventId } })
    await prisma.provider.deleteMany({
      where: { organizationId, name: { startsWith: 'ITEST-PROV' } },
    })
    await prisma.myVehicle.deleteMany({ where: { id: vehicleId } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('appointments', () => {
  it('booking moves the occurrence to ARRANGED and keeps the due date (BR-01)', async () => {
    const occ = await freshOccurrence()
    const apptTime = new Date('2026-01-22T10:00:00Z') // earlier than, and independent of, the due date
    await prisma.$transaction((tx) => bookAppointment(tx, occ.id, { scheduledAt: apptTime }))

    const after = await prisma.eventOccurrence.findUnique({ where: { id: occ.id } })
    expect(after?.status).toBe('ARRANGED')
    expect(after?.dueDate?.toISOString()).toBe(DUE.toISOString()) // due date unchanged
    const appt = await prisma.appointment.findFirst({ where: { occurrenceId: occ.id } })
    expect(appt?.scheduledAt.toISOString()).toBe(apptTime.toISOString())
  })

  it('cancelling an appointment returns the occurrence to ACTION_REQUIRED, not cancelled (BR-05)', async () => {
    const occ = await freshOccurrence()
    const appt = await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date('2026-01-22T10:00:00Z') }),
    )
    await prisma.$transaction((tx) => cancelAppointment(tx, appt.id))

    const after = await prisma.eventOccurrence.findUnique({ where: { id: occ.id } })
    expect(after?.status).toBe('ACTION_REQUIRED') // obligation still open
    expect(after?.dueDate?.toISOString()).toBe(DUE.toISOString()) // due date unchanged
    const cancelled = await prisma.appointment.findUnique({ where: { id: appt.id } })
    expect(cancelled?.status).toBe('CANCELLED')
  })

  it('rescheduling changes the appointment time only (BR-01), occurrence stays ARRANGED', async () => {
    const occ = await freshOccurrence()
    const appt = await prisma.$transaction((tx) =>
      bookAppointment(tx, occ.id, { scheduledAt: new Date('2026-01-22T10:00:00Z') }),
    )
    const newTime = new Date('2026-01-25T14:00:00Z')
    await prisma.$transaction((tx) => rescheduleAppointment(tx, appt.id, newTime))

    const after = await prisma.eventOccurrence.findUnique({ where: { id: occ.id } })
    const moved = await prisma.appointment.findUnique({ where: { id: appt.id } })
    expect(moved?.scheduledAt.toISOString()).toBe(newTime.toISOString())
    expect(after?.status).toBe('ARRANGED')
    expect(after?.dueDate?.toISOString()).toBe(DUE.toISOString())
  })
})

describe('providers', () => {
  it('create, list (active only), and archive', async () => {
    const p = await prisma.$transaction((tx) =>
      createProvider(tx, organizationId, {
        name: 'ITEST-PROV AutoServis',
        category: 'garage',
        phone: '+421900000000',
      }),
    )
    let active = await prisma.$transaction((tx) => listProviders(tx, organizationId))
    expect(active.some((x) => x.id === p.id)).toBe(true)

    await prisma.$transaction((tx) => archiveProvider(tx, p.id))
    active = await prisma.$transaction((tx) => listProviders(tx, organizationId))
    expect(active.some((x) => x.id === p.id)).toBe(false) // archived excluded
  })
})
