import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/db/db'
import {
  canAccessVehicle,
  resolveGarageOwner,
  createInvitation,
  acceptInvitation,
  grantVehicleAccess,
  removeMember,
} from '@/lib/carcare/garage'
import { planDeliveries } from '@/lib/carcare/scheduler'
import { exportGarageData, deleteUserData } from '@/lib/carcare/gdpr'

let organizationId: string
let ownerId: string
let memberId: string
let outsiderId: string
let tempId: string
let ownerMembershipId: string
let memberMembershipId: string
let v1: string
let v2: string
let recurringEventId: string
let ruleId: string

const userIds = () => [ownerId, memberId, outsiderId, tempId].filter(Boolean)

beforeAll(async () => {
  const org = await prisma.organization.findFirst({ select: { id: true } })
  if (!org) throw new Error('no organization in dev DB')
  organizationId = org.id
  const mk = (tag: string) =>
    prisma.user.create({
      data: { email: `itest-g-${tag}-${Date.now()}@example.com`, role: 'CLIENT', organizationId },
    })
  ownerId = (await mk('own')).id
  memberId = (await mk('mem')).id
  outsiderId = (await mk('out')).id
  tempId = (await mk('tmp')).id

  const veh = (n: number) =>
    prisma.myVehicle.create({
      data: {
        organizationId,
        userId: ownerId,
        type: 'ITEST',
        registration: `IT-${(Date.now() + n) % 100000000}`,
      },
    })
  v1 = (await veh(1)).id
  v2 = (await veh(2)).id

  ownerMembershipId = (
    await prisma.garageMembership.create({
      data: { organizationId, userId: ownerId, role: 'OWNER' },
    })
  ).id
  memberMembershipId = (
    await prisma.garageMembership.create({
      data: { organizationId, userId: memberId, role: 'MEMBER' },
    })
  ).id
  await prisma.$transaction((tx) => grantVehicleAccess(tx, memberMembershipId, v1)) // member can access v1 only

  const def = await prisma.recurringEvent.create({
    data: {
      organizationId,
      vehicleId: v1,
      name: 'ITEST GARAGE',
      category: 'inspection',
      recurrenceType: 'FIXED_INTERVAL',
      intervalMonths: 24,
      responsibleUserId: null,
    },
  })
  recurringEventId = def.id
  ruleId = (
    await prisma.notificationRule.create({
      data: {
        organizationId,
        recurringEventId: null,
        stage: 'BOOKING',
        leadDays: 14,
        channels: ['IN_APP'],
      },
    })
  ).id
})

afterAll(async () => {
  try {
    await prisma.notificationDelivery.deleteMany({ where: { recipientUserId: { in: userIds() } } })
    await prisma.eventOccurrence.deleteMany({ where: { recurringEventId } })
    await prisma.notificationRule.deleteMany({ where: { id: ruleId } })
    await prisma.recurringEvent.deleteMany({ where: { id: recurringEventId } })
    await prisma.garageInvitation.deleteMany({
      where: { organizationId, email: { startsWith: 'itest-g-' } },
    })
    await prisma.garageMembership.deleteMany({ where: { userId: { in: userIds() } } }) // cascades vehicle_access
    await prisma.myVehicle.deleteMany({ where: { id: { in: [v1, v2] } } })
    await prisma.user.deleteMany({ where: { id: { in: userIds() } } })
  } finally {
    await prisma.$disconnect()
  }
})

describe('garage access & sharing', () => {
  it('owner sees all vehicles; member only granted ones; outsider none', async () => {
    expect(await prisma.$transaction((tx) => canAccessVehicle(tx, ownerId, v1))).toBe(true)
    expect(await prisma.$transaction((tx) => canAccessVehicle(tx, ownerId, v2))).toBe(true)
    expect(await prisma.$transaction((tx) => canAccessVehicle(tx, memberId, v1))).toBe(true)
    expect(await prisma.$transaction((tx) => canAccessVehicle(tx, memberId, v2))).toBe(false)
    expect(await prisma.$transaction((tx) => canAccessVehicle(tx, outsiderId, v1))).toBe(false)
  })

  it('default access: a member with no grants sees all; a grant then restricts', async () => {
    const u = await prisma.user.create({
      data: { email: `itest-g-def-${Date.now()}@example.com`, role: 'CLIENT', organizationId },
    })
    const m = await prisma.garageMembership.create({
      data: { organizationId, userId: u.id, role: 'MEMBER' },
    })
    try {
      expect(await prisma.$transaction((tx) => canAccessVehicle(tx, u.id, v1))).toBe(true)
      expect(await prisma.$transaction((tx) => canAccessVehicle(tx, u.id, v2))).toBe(true)

      await prisma.$transaction((tx) => grantVehicleAccess(tx, m.id, v1))
      expect(await prisma.$transaction((tx) => canAccessVehicle(tx, u.id, v1))).toBe(true)
      expect(await prisma.$transaction((tx) => canAccessVehicle(tx, u.id, v2))).toBe(false)
    } finally {
      await prisma.garageMembership.deleteMany({ where: { id: m.id } })
      await prisma.user.deleteMany({ where: { id: u.id } })
    }
  })

  it('resolveGarageOwner returns the OWNER member', async () => {
    expect(await prisma.$transaction((tx) => resolveGarageOwner(tx, organizationId))).toBe(ownerId)
  })

  it('owner fallback: an event with no responsible user plans reminders to the owner', async () => {
    const occ = await prisma.eventOccurrence.create({
      data: {
        recurringEventId,
        vehicleId: v1,
        sequenceNo: Date.now() % 1000000,
        status: 'ACTION_REQUIRED',
        dueDate: new Date('2026-02-06T00:00:00Z'),
      },
    })
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id))
    const d = await prisma.notificationDelivery.findFirst({ where: { occurrenceId: occ.id } })
    expect(d?.recipientUserId).toBe(ownerId)
  })

  it('invitation: accept creates a membership with the invited role', async () => {
    const invitee = await prisma.user.findUnique({
      where: { id: outsiderId },
      select: { email: true },
    })
    const inv = await prisma.$transaction((tx) =>
      createInvitation(tx, {
        organizationId,
        email: invitee!.email,
        role: 'VIEWER',
      }),
    )
    const membership = await prisma.$transaction((tx) =>
      acceptInvitation(tx, inv.token, outsiderId),
    )
    expect(membership.role).toBe('VIEWER')
    const reloaded = await prisma.garageInvitation.findUnique({ where: { id: inv.id } })
    expect(reloaded?.status).toBe('ACCEPTED')
  })

  it('invitation: accept is rejected when the signed-in email does not match', async () => {
    const inv = await prisma.$transaction((tx) =>
      createInvitation(tx, {
        organizationId,
        email: `itest-g-other-${Date.now()}@example.com`,
        role: 'MEMBER',
      }),
    )
    await expect(
      prisma.$transaction((tx) => acceptInvitation(tx, inv.token, tempId)),
    ).rejects.toThrow('EMAIL_MISMATCH')
    const reloaded = await prisma.garageInvitation.findUnique({ where: { id: inv.id } })
    expect(reloaded?.status).toBe('PENDING')
  })

  it('removing a member detaches their events (→ owner) and suppresses their reminders', async () => {
    const def = await prisma.recurringEvent.create({
      data: {
        organizationId,
        vehicleId: v1,
        name: 'ITEST RM',
        category: 'inspection',
        recurrenceType: 'FIXED_INTERVAL',
        intervalMonths: 24,
        responsibleUserId: memberId,
      },
    })
    const occ = await prisma.eventOccurrence.create({
      data: {
        recurringEventId: def.id,
        vehicleId: v1,
        sequenceNo: Date.now() % 1000000,
        status: 'ACTION_REQUIRED',
        dueDate: new Date('2026-02-06T00:00:00Z'),
      },
    })
    await prisma.$transaction((tx) => planDeliveries(tx, occ.id)) // delivery to the member

    await prisma.$transaction((tx) => removeMember(tx, organizationId, memberId))

    const reloaded = await prisma.recurringEvent.findUnique({ where: { id: def.id } })
    expect(reloaded?.responsibleUserId).toBeNull() // detached
    const memberDeliveries = await prisma.notificationDelivery.findMany({
      where: { occurrenceId: occ.id, recipientUserId: memberId, status: 'SCHEDULED' },
    })
    expect(memberDeliveries).toHaveLength(0) // their reminders suppressed
    expect(
      await prisma.garageMembership.count({ where: { organizationId, userId: memberId } }),
    ).toBe(0)

    await prisma.$transaction((tx) => planDeliveries(tx, occ.id)) // re-plan → owner fallback
    const ownerDelivery = await prisma.notificationDelivery.findFirst({
      where: { occurrenceId: occ.id, recipientUserId: ownerId, status: 'SCHEDULED' },
    })
    expect(ownerDelivery).not.toBeNull()

    await prisma.notificationDelivery.deleteMany({ where: { occurrenceId: occ.id } })
    await prisma.eventOccurrence.deleteMany({ where: { recurringEventId: def.id } })
    await prisma.recurringEvent.deleteMany({ where: { id: def.id } })
  })

  it('GDPR export returns a bundle containing the garage vehicles and members', async () => {
    const bundle = await prisma.$transaction((tx) => exportGarageData(tx, organizationId))
    expect(bundle.vehicles.some((v) => v.id === v1)).toBe(true)
    expect(bundle.members.some((m) => m.userId === ownerId)).toBe(true)
  })

  it('GDPR erasure anonymizes the user and removes their memberships & deliveries', async () => {
    // give tempId a membership + a delivery
    const m = await prisma.garageMembership.create({
      data: { organizationId, userId: tempId, role: 'MEMBER' },
    })
    await prisma.notificationDelivery.create({
      data: {
        occurrenceId: (await prisma.eventOccurrence.findFirst({ where: { recurringEventId } }))!.id,
        recurringEventId,
        stage: 'DEADLINE',
        channel: 'IN_APP',
        recipientUserId: tempId,
        scheduledFor: new Date(),
        dedupeKey: `itest-g-del-${Date.now()}`,
      },
    })

    await prisma.$transaction((tx) => deleteUserData(tx, tempId))

    const u = await prisma.user.findUnique({ where: { id: tempId } })
    expect(u?.deletedAt).not.toBeNull()
    expect(u?.email).toBe(`deleted-${tempId}@removed.invalid`)
    expect(u?.phoneNumber).toBeNull()
    expect(await prisma.garageMembership.count({ where: { id: m.id } })).toBe(0)
    expect(await prisma.notificationDelivery.count({ where: { recipientUserId: tempId } })).toBe(0)
  })
})
