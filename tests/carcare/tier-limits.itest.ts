import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { NotificationStage } from '@prisma/client'
import prisma from '@/db/db'
import { dispatchDue } from '@/lib/carcare/scheduler'
import { createVehicle } from '@/lib/carcare/vehicles'
import { assertUserCapacity, TierLimitError } from '@/lib/carcare/limits'
import type { Channels, DeliveryContext } from '@/lib/carcare/channels'

const PAST = new Date(Date.now() - 60 * 60 * 1000)
const noopChannels: Channels = {
  IN_APP: async () => {},
  EMAIL: async (_d: DeliveryContext) => {},
  SMS: async (_d: DeliveryContext) => {},
  PUSH: async (_d: DeliveryContext) => {},
}

const tag = `tl-${Date.now()}`
let regSeq = 0
const createdOrgIds: string[] = []
let freeTierId: string
let paidTierId: string

async function makeOrg(opts: {
  tierId?: string
  vehiclesLimit?: number
  usersLimit?: number
  currentVehiclesCount?: number
  currentUsersCount?: number
  currentNotificationsCount?: number
}) {
  const org = await prisma.organization.create({
    data: {
      name: `${tag}-org`,
      tierId: opts.tierId ?? null,
      vehiclesLimit: opts.vehiclesLimit ?? null,
      usersLimit: opts.usersLimit ?? null,
      currentVehiclesCount: opts.currentVehiclesCount ?? 0,
      currentUsersCount: opts.currentUsersCount ?? 0,
      currentNotificationsCount: opts.currentNotificationsCount ?? 0,
    },
  })
  createdOrgIds.push(org.id)
  return org
}

async function makeReminderDelivery(
  orgId: string,
  userId: string,
  channel: 'EMAIL' | 'SMS',
  stage: NotificationStage = 'BOOKING',
) {
  regSeq += 1
  const vehicle = await prisma.myVehicle.create({
    data: {
      organizationId: orgId,
      userId,
      type: 'ITEST',
      registration: `R${Date.now() % 100000}${regSeq}`,
    },
  })
  const re = await prisma.recurringEvent.create({
    data: {
      organizationId: orgId,
      vehicleId: vehicle.id,
      name: `${tag}-ev`,
      category: 'inspection',
      recurrenceType: 'ONE_TIME',
    },
  })
  const occ = await prisma.eventOccurrence.create({
    data: {
      recurringEventId: re.id,
      vehicleId: vehicle.id,
      sequenceNo: 1,
      status: 'UPCOMING',
      dueDate: PAST,
    },
  })
  const del = await prisma.notificationDelivery.create({
    data: {
      occurrenceId: occ.id,
      recurringEventId: re.id,
      stage,
      channel,
      recipientUserId: userId,
      scheduledFor: PAST,
      status: 'SCHEDULED',
      dedupeKey: `${tag}-${channel}-${Math.random()}`,
    },
  })
  return { reId: re.id, occId: occ.id, delId: del.id }
}

beforeAll(async () => {
  // checkNotificationLimit branches on the exact tier name, so use the real names.
  // (itests run on a throwaway DB that has no tiers seeded.)
  const free = await prisma.tier.create({
    data: {
      name: 'FREE',
      usersLimit: 50,
      vehiclesLimit: 50,
      notificationsLimit: 1,
    },
  })
  freeTierId = free.id
  const paid = await prisma.tier.create({
    data: {
      name: 'BASIC',
      usersLimit: 50,
      vehiclesLimit: 50,
      notificationsLimit: 2,
    },
  })
  paidTierId = paid.id
})

afterAll(async () => {
  try {
    await prisma.notificationDelivery.deleteMany({
      where: { recurringEvent: { name: `${tag}-ev` } },
    })
    await prisma.eventOccurrence.deleteMany({ where: { recurringEvent: { name: `${tag}-ev` } } })
    await prisma.recurringEvent.deleteMany({ where: { name: `${tag}-ev` } })
    await prisma.myVehicle.deleteMany({ where: { organizationId: { in: createdOrgIds } } })
    await prisma.user.deleteMany({ where: { organizationId: { in: createdOrgIds } } })
    await prisma.organization.deleteMany({ where: { id: { in: createdOrgIds } } })
    await prisma.tier.deleteMany({ where: { id: { in: [freeTierId, paidTierId] } } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('vehicle limit', () => {
  it('blocks creating a vehicle at the effective limit', async () => {
    const org = await makeOrg({ vehiclesLimit: 2, currentVehiclesCount: 2 })
    const u = await prisma.user.create({
      data: { email: `${tag}-v@e.com`, role: 'CLIENT', organizationId: org.id },
    })
    await expect(
      prisma.$transaction((tx) => createVehicle(tx, org.id, u.id, { registration: `${tag}-X` })),
    ).rejects.toBeInstanceOf(TierLimitError)
  })

  it('allows a vehicle below the limit', async () => {
    const org = await makeOrg({ vehiclesLimit: 2, currentVehiclesCount: 1 })
    const u = await prisma.user.create({
      data: { email: `${tag}-v2@e.com`, role: 'CLIENT', organizationId: org.id },
    })
    const v = await prisma.$transaction((tx) =>
      createVehicle(tx, org.id, u.id, { registration: `${tag}-Y` }),
    )
    expect(v.id).toBeTruthy()
  })
})

describe('user limit', () => {
  it('blocks at the limit counting active users + pending invites', async () => {
    const org = await makeOrg({ usersLimit: 2, currentUsersCount: 1 })
    await prisma.garageInvitation.create({
      data: {
        organizationId: org.id,
        email: `${tag}-inv@e.com`,
        token: `${tag}-tok`,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000),
      },
    })
    // 1 active + 1 pending = 2 >= limit 2
    await expect(
      prisma.$transaction((tx) => assertUserCapacity(tx, org.id)),
    ).rejects.toBeInstanceOf(TierLimitError)
    await prisma.garageInvitation.deleteMany({ where: { organizationId: org.id } })
  })
})

describe('notification metering', () => {
  it('counts SMS but not the EMAIL of the same reminder, and blocks over the paid limit', async () => {
    const org = await makeOrg({ tierId: paidTierId }) // notificationsLimit 2
    const u = await prisma.user.create({
      data: {
        email: `${tag}-n@e.com`,
        role: 'CLIENT',
        organizationId: org.id,
        phoneNumber: '+421900000001',
        channelOptIns: ['EMAIL', 'SMS'],
        smsMonthlyLimit: 99,
      },
    })
    // reminder 1: SMS + EMAIL — only SMS should count (1)
    const r1 = await makeReminderDelivery(org.id, u.id, 'SMS')
    await prisma.notificationDelivery.create({
      data: {
        occurrenceId: r1.occId,
        recurringEventId: r1.reId,
        stage: 'BOOKING',
        channel: 'EMAIL',
        recipientUserId: u.id,
        scheduledFor: PAST,
        status: 'SCHEDULED',
        dedupeKey: `${tag}-E-${Math.random()}`,
      },
    })
    await dispatchDue(prisma, noopChannels)
    let after = await prisma.organization.findUnique({ where: { id: org.id } })
    expect(after?.currentNotificationsCount).toBe(1) // SMS counted, its EMAIL did not

    // reminder 2: EMAIL only — counts (2, at limit)
    await makeReminderDelivery(org.id, u.id, 'EMAIL')
    await dispatchDue(prisma, noopChannels)
    after = await prisma.organization.findUnique({ where: { id: org.id } })
    expect(after?.currentNotificationsCount).toBe(2)

    // reminder 3: EMAIL only — over limit → suppressed, not counted
    const r3 = await makeReminderDelivery(org.id, u.id, 'EMAIL')
    await dispatchDue(prisma, noopChannels)
    const d3 = await prisma.notificationDelivery.findUnique({ where: { id: r3.delId } })
    expect(d3?.status).toBe('SUPPRESSED')
    expect(d3?.suppressedReason).toBe('notification limit reached')
  })

  it('FREE tier soft-deletes the org when its lifetime limit is exceeded', async () => {
    const org = await makeOrg({ tierId: freeTierId, currentNotificationsCount: 1 }) // limit 1, already at it
    const u = await prisma.user.create({
      data: {
        email: `${tag}-f@e.com`,
        role: 'CLIENT',
        organizationId: org.id,
        channelOptIns: ['EMAIL'],
      },
    })
    const r = await makeReminderDelivery(org.id, u.id, 'EMAIL')
    await dispatchDue(prisma, noopChannels)
    const d = await prisma.notificationDelivery.findUnique({ where: { id: r.delId } })
    expect(d?.status).toBe('SUPPRESSED')
    const after = await prisma.organization.findUnique({ where: { id: org.id } })
    expect(after?.deletedAt).not.toBeNull()
  })
})
