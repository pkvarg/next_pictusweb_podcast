import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import prisma from '@/db/db'
import { dispatchDue } from '@/lib/carcare/scheduler'
import type { Channels, DeliveryContext } from '@/lib/carcare/channels'

let organizationId: string
let userId: string
let vehicleId: string
let recurringEventId: string
let occurrenceId: string

const PAST = new Date(Date.now() - 60 * 60 * 1000)
const FUTURE = new Date(Date.now() + 24 * 60 * 60 * 1000)

// fake channels: record each send; EMAIL can be made to throw
const sends: Array<{ channel: string }> = []
let emailThrows = false
const fakeChannels: Channels = {
  IN_APP: async (d: DeliveryContext) => void sends.push({ channel: d.channel }),
  EMAIL: async (d: DeliveryContext) => {
    if (emailThrows) throw new Error('smtp down')
    sends.push({ channel: d.channel })
  },
  SMS: async (d: DeliveryContext) => void sends.push({ channel: d.channel }),
  PUSH: async (d: DeliveryContext) => void sends.push({ channel: d.channel }),
}

let seq = 0
function makeDelivery(channel: 'EMAIL' | 'SMS' | 'IN_APP' | 'PUSH', scheduledFor: Date) {
  seq++
  return prisma.notificationDelivery.create({
    data: {
      occurrenceId,
      recurringEventId,
      stage: 'DEADLINE',
      channel,
      recipientUserId: userId,
      scheduledFor,
      status: 'SCHEDULED',
      dedupeKey: `itest-disp-${Date.now()}-${seq}`,
    },
  })
}

beforeAll(async () => {
  const org = await prisma.organization.findFirst({ select: { id: true } })
  if (!org) throw new Error('no organization in dev DB')
  organizationId = org.id
  const user = await prisma.user.create({
    data: {
      email: `itest-disp-${Date.now()}@example.com`,
      role: 'CLIENT',
      organizationId,
      phoneNumber: '+421900000000',
      channelOptIns: ['EMAIL', 'SMS'],
      smsMonthlyLimit: 5,
      smsSentThisMonth: 0,
    },
  })
  userId = user.id
  const vehicle = await prisma.myVehicle.create({
    data: { organizationId, userId, type: 'ITEST', registration: `IT-${Date.now() % 100000000}` },
  })
  vehicleId = vehicle.id
  const def = await prisma.recurringEvent.create({
    data: {
      organizationId,
      vehicleId,
      name: 'ITEST DISP',
      category: 'inspection',
      recurrenceType: 'FIXED_INTERVAL',
      intervalMonths: 24,
      responsibleUserId: userId,
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

beforeEach(async () => {
  sends.length = 0
  emailThrows = false
  await prisma.notificationDelivery.deleteMany({ where: { recurringEventId } })
  await prisma.user.update({
    where: { id: userId },
    data: { channelOptIns: ['EMAIL', 'SMS'], smsMonthlyLimit: 5, smsSentThisMonth: 0 },
  })
})

afterAll(async () => {
  try {
    await prisma.notificationDelivery.deleteMany({ where: { recurringEventId } })
    await prisma.eventOccurrence.deleteMany({ where: { recurringEventId } })
    await prisma.recurringEvent.deleteMany({ where: { id: recurringEventId } })
    await prisma.myVehicle.deleteMany({ where: { id: vehicleId } })
    await prisma.user.deleteMany({ where: { id: userId } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('dispatcher', () => {
  it('sends due deliveries, leaves future ones, and is safe to re-run (T11)', async () => {
    const email = await makeDelivery('EMAIL', PAST)
    await makeDelivery('IN_APP', PAST)
    const future = await makeDelivery('EMAIL', FUTURE)

    const r1 = await dispatchDue(prisma, fakeChannels)
    expect(r1.sent).toBe(2)
    expect(
      (await prisma.notificationDelivery.findUnique({ where: { id: email.id } }))?.status,
    ).toBe('SENT')
    expect(
      (await prisma.notificationDelivery.findUnique({ where: { id: future.id } }))?.status,
    ).toBe('SCHEDULED')

    const r2 = await dispatchDue(prisma, fakeChannels) // re-run: nothing new
    expect(r2.sent).toBe(0)
    expect(r2.claimed).toBe(0)
  })

  it('T12: SMS over the monthly limit is suppressed; other channels still send', async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { smsMonthlyLimit: 2, smsSentThisMonth: 2 },
    })
    const sms = await makeDelivery('SMS', PAST)
    const email = await makeDelivery('EMAIL', PAST)

    await dispatchDue(prisma, fakeChannels)
    expect((await prisma.notificationDelivery.findUnique({ where: { id: sms.id } }))?.status).toBe(
      'SUPPRESSED',
    )
    expect(
      (await prisma.notificationDelivery.findUnique({ where: { id: email.id } }))?.status,
    ).toBe('SENT')
    expect(sends.filter((s) => s.channel === 'SMS')).toHaveLength(0)
  })

  it('SMS success increments the monthly counter', async () => {
    await makeDelivery('SMS', PAST)
    await dispatchDue(prisma, fakeChannels)
    const u = await prisma.user.findUnique({ where: { id: userId } })
    expect(u?.smsSentThisMonth).toBe(1)
  })

  it('T13: a send failure is retried (back to SCHEDULED) with the error recorded', async () => {
    emailThrows = true
    const email = await makeDelivery('EMAIL', PAST)
    const r = await dispatchDue(prisma, fakeChannels)
    expect(r.failed).toBe(1)
    const d = await prisma.notificationDelivery.findUnique({ where: { id: email.id } })
    expect(d?.status).toBe('SCHEDULED')
    expect(d?.attempts).toBe(1)
    expect(d?.lastError).toContain('smtp down')
  })

  it('suppresses a channel the recipient has not opted into', async () => {
    await prisma.user.update({ where: { id: userId }, data: { channelOptIns: ['EMAIL'] } })
    const sms = await makeDelivery('SMS', PAST)
    await dispatchDue(prisma, fakeChannels)
    const d = await prisma.notificationDelivery.findUnique({ where: { id: sms.id } })
    expect(d?.status).toBe('SUPPRESSED')
    expect(d?.suppressedReason).toBe('channel not opted in')
  })
})
