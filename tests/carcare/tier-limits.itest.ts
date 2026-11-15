import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { NotificationStage } from '@prisma/client'
import prisma from '@/db/db'
import { dispatchDue, planDeliveries } from '@/lib/carcare/scheduler'
import { createVehicle } from '@/lib/carcare/vehicles'
import { assertUserCapacity, TierLimitError } from '@/lib/carcare/limits'
import { canCreateResource } from '@/lib/tier-limits'
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
    await prisma.notificationRule.deleteMany({ where: { recurringEvent: { name: `${tag}-ev` } } })
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
  it('counts only SMS; email is unlimited; SMS over the limit is suppressed without a fallback', async () => {
    const org = await makeOrg({ tierId: paidTierId }) // BASIC, notificationsLimit 2
    const count = async () =>
      (await prisma.organization.findUnique({ where: { id: org.id } }))?.currentNotificationsCount
    const status = async (id: string) =>
      (await prisma.notificationDelivery.findUnique({ where: { id } }))?.status
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

    // EMAIL on a paid tier is free: sent, never counted.
    const e1 = await makeReminderDelivery(org.id, u.id, 'EMAIL')
    await dispatchDue(prisma, noopChannels)
    expect(await count()).toBe(0)
    expect(await status(e1.delId)).toBe('SENT')

    // SMS counts, up to the limit.
    await makeReminderDelivery(org.id, u.id, 'SMS')
    await dispatchDue(prisma, noopChannels)
    expect(await count()).toBe(1)
    await makeReminderDelivery(org.id, u.id, 'SMS')
    await dispatchDue(prisma, noopChannels)
    expect(await count()).toBe(2) // at the limit

    // EMAIL at the limit still goes out and does not count (email is unlimited).
    const e2 = await makeReminderDelivery(org.id, u.id, 'EMAIL')
    await dispatchDue(prisma, noopChannels)
    expect(await count()).toBe(2)
    expect(await status(e2.delId)).toBe('SENT')

    // SMS over the limit for an SMS-only recipient (no email to fall back to) is suppressed.
    const s = await prisma.user.create({
      data: {
        email: `${tag}-s@e.com`,
        role: 'CLIENT',
        organizationId: org.id,
        phoneNumber: '+421900000002',
        channelOptIns: ['SMS'],
        smsMonthlyLimit: 99,
      },
    })
    const r = await makeReminderDelivery(org.id, s.id, 'SMS')
    await dispatchDue(prisma, noopChannels)
    const dr = await prisma.notificationDelivery.findUnique({ where: { id: r.delId } })
    expect(dr?.status).toBe('SUPPRESSED')
    expect(dr?.suppressedReason).toBe('notification limit reached')
  })

  it('FREE tier blocks the org (upgrade required), not deletes, when the lifetime limit is exceeded', async () => {
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
    expect(d?.suppressedReason).toBe('free trial expired')
    const after = await prisma.organization.findUnique({ where: { id: org.id } })
    expect(after?.notificationsBlocked).toBe(true)
    expect(after?.deletedAt).toBeNull()
  })
})

describe('SMS is a paid-plan channel', () => {
  async function planWithSmsRule(tierId: string) {
    const org = await makeOrg({ tierId })
    const u = await prisma.user.create({
      data: {
        email: `${tag}-sms-${Math.random()}@e.com`,
        role: 'CLIENT',
        organizationId: org.id,
        phoneNumber: '+421900000009',
        channelOptIns: ['EMAIL', 'SMS'],
      },
    })
    regSeq += 1
    const vehicle = await prisma.myVehicle.create({
      data: {
        organizationId: org.id,
        userId: u.id,
        type: 'ITEST',
        registration: `S${Date.now() % 100000}${regSeq}`,
      },
    })
    const re = await prisma.recurringEvent.create({
      data: {
        organizationId: org.id,
        vehicleId: vehicle.id,
        name: `${tag}-ev`,
        category: 'inspection',
        recurrenceType: 'ONE_TIME',
        responsibleUserId: u.id,
      },
    })
    await prisma.notificationRule.create({
      data: {
        organizationId: org.id,
        recurringEventId: re.id,
        stage: 'BOOKING',
        leadDays: 0,
        channels: ['SMS', 'EMAIL', 'IN_APP'],
      },
    })
    const occ = await prisma.eventOccurrence.create({
      data: {
        recurringEventId: re.id,
        vehicleId: vehicle.id,
        sequenceNo: regSeq,
        status: 'UPCOMING',
        dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      },
    })
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    return prisma.notificationDelivery.findMany({ where: { occurrenceId: occ.id } })
  }

  it('FREE: SMS is not planned, EMAIL is', async () => {
    const dels = await planWithSmsRule(freeTierId)
    expect(dels.some((d) => d.channel === 'SMS')).toBe(false)
    expect(dels.some((d) => d.channel === 'EMAIL')).toBe(true)
  })

  it('BASIC: SMS is planned', async () => {
    const dels = await planWithSmsRule(paidTierId)
    expect(dels.some((d) => d.channel === 'SMS')).toBe(true)
  })
})

describe('benefit sub-org limits (Option B: optional cap, parent pool as ceiling)', () => {
  it('enforces the sub-org cap and the parent pool via checkTierLimit', async () => {
    const parent = await makeOrg({ tierId: paidTierId, vehiclesLimit: 3, currentVehiclesCount: 0 })
    const capped = await prisma.organization.create({
      data: {
        name: `${tag}-sub-capped`,
        tierId: paidTierId,
        isBenefitOrg: true,
        parentOrganizationId: parent.id,
        vehiclesLimit: 1,
        currentVehiclesCount: 1,
      },
    })
    const uncapped = await prisma.organization.create({
      data: {
        name: `${tag}-sub-uncapped`,
        tierId: paidTierId,
        isBenefitOrg: true,
        parentOrganizationId: parent.id,
        vehiclesLimit: null,
        currentVehiclesCount: 0,
      },
    })

    // Capped sub-org at its own cap → blocked, even though the pool still has room.
    expect(await canCreateResource(capped.id, 'vehicles')).toBe(false)
    // Uncapped sub-org draws from the shared pool (used 0 + 1 + 0 = 1 < 3) → allowed.
    expect(await canCreateResource(uncapped.id, 'vehicles')).toBe(true)

    // Fill the pool: parent 2 + capped 1 + uncapped 0 = 3 = limit → uncapped now blocked.
    await prisma.organization.update({
      where: { id: parent.id },
      data: { currentVehiclesCount: 2 },
    })
    expect(await canCreateResource(uncapped.id, 'vehicles')).toBe(false)

    await prisma.organization.deleteMany({ where: { id: { in: [capped.id, uncapped.id] } } })
  })
})

describe('benefit sub-org vehicle creation (dual-path pool fix)', () => {
  it('createVehicle on an uncapped benefit sub-org is blocked when the parent pool is full', async () => {
    const parent = await makeOrg({ tierId: paidTierId, vehiclesLimit: 2, currentVehiclesCount: 2 })
    const sub = await prisma.organization.create({
      data: {
        name: `${tag}-sub-pool`,
        tierId: paidTierId,
        isBenefitOrg: true,
        parentOrganizationId: parent.id,
        vehiclesLimit: null,
        currentVehiclesCount: 0,
      },
    })
    const u = await prisma.user.create({
      data: { email: `${tag}-subpool@e.com`, role: 'CLIENT', organizationId: sub.id },
    })
    await expect(
      prisma.$transaction((tx) => createVehicle(tx, sub.id, u.id, { registration: `${tag}-POOL` })),
    ).rejects.toBeInstanceOf(TierLimitError)
    await prisma.user.deleteMany({ where: { organizationId: sub.id } })
    await prisma.organization.deleteMany({ where: { id: sub.id } })
  })
})
