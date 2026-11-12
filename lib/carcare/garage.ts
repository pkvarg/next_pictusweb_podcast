import { Prisma, GarageRole } from '@prisma/client'
import { randomUUID } from 'crypto'

// The recipient fallback for reminders when an event has no responsible user:
// the garage OWNER, bridging legacy data (isFleetManager, else any org member).
export async function resolveGarageOwner(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<string | null> {
  const owner = await tx.garageMembership.findFirst({
    where: { organizationId, role: 'OWNER' },
    orderBy: { createdAt: 'asc' },
  })
  if (owner) return owner.userId

  const fleetManager = await tx.user.findFirst({
    where: { organizationId, isFleetManager: true, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  })
  if (fleetManager) return fleetManager.id

  const anyUser = await tx.user.findFirst({
    where: { organizationId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  })
  return anyUser?.id ?? null
}

// The people who can receive notifications in a garage: its memberships, or — before any
// membership exists (legacy single-org bridge) — the organization's own users. Used to
// detect the "only one person" case, where there is no one to choose between.
export async function orgMemberIds(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<string[]> {
  const memberships = await tx.garageMembership.findMany({
    where: { organizationId },
    select: { userId: true },
  })
  if (memberships.length > 0) return [...new Set(memberships.map((m) => m.userId))]

  const users = await tx.user.findMany({
    where: { organizationId, deletedAt: null },
    select: { id: true },
  })
  return users.map((u) => u.id)
}

// Backend access check. Global ADMIN sees everything; a garage OWNER sees all vehicles
// in the garage; MEMBER/VIEWER see only vehicles explicitly granted to them. Legacy
// bridge: while a garage has no memberships yet, the original single-org rule applies.
export async function canAccessVehicle(
  tx: Prisma.TransactionClient,
  userId: string,
  vehicleId: string,
): Promise<boolean> {
  const vehicle = await tx.myVehicle.findUnique({
    where: { id: vehicleId },
    select: { organizationId: true },
  })
  if (!vehicle) return false

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { role: true, organizationId: true },
  })
  if (!user) return false
  if (user.role === 'ADMIN') return true

  const membership = await tx.garageMembership.findUnique({
    where: { organizationId_userId: { organizationId: vehicle.organizationId, userId } },
  })
  if (membership) {
    if (membership.role === 'OWNER') return true
    const accessCount = await tx.vehicleAccess.count({ where: { membershipId: membership.id } })
    if (accessCount === 0) return true
    const access = await tx.vehicleAccess.findUnique({
      where: { membershipId_vehicleId: { membershipId: membership.id, vehicleId } },
    })
    return !!access
  }

  const membershipCount = await tx.garageMembership.count({
    where: { organizationId: vehicle.organizationId },
  })
  if (membershipCount === 0) return user.organizationId === vehicle.organizationId
  return false
}

export async function resolveGarageRole(
  tx: Prisma.TransactionClient,
  userId: string,
  organizationId: string,
): Promise<{ role: GarageRole | 'ADMIN' | null; isLegacyOwner: boolean }> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { role: true, organizationId: true },
  })
  if (!user) return { role: null, isLegacyOwner: false }
  if (user.role === 'ADMIN') return { role: 'ADMIN', isLegacyOwner: false }

  const membership = await tx.garageMembership.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  })
  if (membership) return { role: membership.role, isLegacyOwner: false }

  const membershipCount = await tx.garageMembership.count({ where: { organizationId } })
  if (membershipCount === 0 && user.organizationId === organizationId) {
    return { role: 'OWNER', isLegacyOwner: true }
  }
  return { role: null, isLegacyOwner: false }
}

export async function ensureOwnerMembership(
  tx: Prisma.TransactionClient,
  userId: string,
  organizationId: string,
): Promise<void> {
  await tx.garageMembership.upsert({
    where: { organizationId_userId: { organizationId, userId } },
    create: { organizationId, userId, role: 'OWNER' },
    update: {},
  })
}

export async function createInvitation(
  tx: Prisma.TransactionClient,
  params: {
    organizationId: string
    email: string
    role?: GarageRole
    invitedByUserId?: string | null
    ttlDays?: number
  },
) {
  const { organizationId, email, role = 'MEMBER', invitedByUserId = null, ttlDays = 7 } = params
  return tx.garageInvitation.create({
    data: {
      organizationId,
      email: email.toLowerCase().trim(),
      role,
      token: randomUUID(),
      expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      invitedByUserId,
    },
  })
}

export async function acceptInvitation(
  tx: Prisma.TransactionClient,
  token: string,
  userId: string,
) {
  const inv = await tx.garageInvitation.findUnique({ where: { token } })
  if (!inv) throw new Error('invitation not found')
  if (inv.status !== 'PENDING') throw new Error(`invitation is ${inv.status}`)
  if (inv.expiresAt < new Date()) {
    await tx.garageInvitation.update({ where: { id: inv.id }, data: { status: 'EXPIRED' } })
    throw new Error('invitation expired')
  }

  const user = await tx.user.findUnique({ where: { id: userId }, select: { email: true } })
  if (!user || user.email.toLowerCase().trim() !== inv.email.toLowerCase().trim()) {
    throw new Error('EMAIL_MISMATCH')
  }

  const membership = await tx.garageMembership.upsert({
    where: { organizationId_userId: { organizationId: inv.organizationId, userId } },
    create: { organizationId: inv.organizationId, userId, role: inv.role },
    update: { role: inv.role },
  })
  await tx.garageInvitation.update({ where: { id: inv.id }, data: { status: 'ACCEPTED' } })
  return membership
}

export async function grantVehicleAccess(
  tx: Prisma.TransactionClient,
  membershipId: string,
  vehicleId: string,
) {
  return tx.vehicleAccess.upsert({
    where: { membershipId_vehicleId: { membershipId, vehicleId } },
    create: { membershipId, vehicleId },
    update: {},
  })
}

export async function revokeVehicleAccess(
  tx: Prisma.TransactionClient,
  membershipId: string,
  vehicleId: string,
) {
  await tx.vehicleAccess.deleteMany({ where: { membershipId, vehicleId } })
}

// Write access: can access the vehicle AND is not a read-only VIEWER.
export async function canModifyVehicle(
  tx: Prisma.TransactionClient,
  userId: string,
  vehicleId: string,
): Promise<boolean> {
  if (!(await canAccessVehicle(tx, userId, vehicleId))) return false
  const vehicle = await tx.myVehicle.findUnique({
    where: { id: vehicleId },
    select: { organizationId: true },
  })
  if (!vehicle) return false
  const user = await tx.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (user?.role === 'ADMIN') return true
  const membership = await tx.garageMembership.findUnique({
    where: { organizationId_userId: { organizationId: vehicle.organizationId, userId } },
  })
  if (membership) return membership.role !== 'VIEWER'
  return true // legacy single-org bridge
}

// Vehicle ids a user may see in a garage (ADMIN/OWNER/legacy → all; MEMBER/VIEWER → granted).
export async function listAccessibleVehicleIds(
  tx: Prisma.TransactionClient,
  userId: string,
  organizationId: string,
): Promise<string[]> {
  const user = await tx.user.findUnique({ where: { id: userId }, select: { role: true } })
  const membership = await tx.garageMembership.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  })
  const membershipCount = await tx.garageMembership.count({ where: { organizationId } })

  if (user?.role === 'ADMIN' || membership?.role === 'OWNER' || membershipCount === 0) {
    const vs = await tx.myVehicle.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    })
    return vs.map((v) => v.id)
  }
  if (membership) {
    const access = await tx.vehicleAccess.findMany({
      where: { membershipId: membership.id },
      select: { vehicleId: true },
    })
    if (access.length === 0) {
      const vs = await tx.myVehicle.findMany({
        where: { organizationId, deletedAt: null },
        select: { id: true },
      })
      return vs.map((v) => v.id)
    }
    return access.map((a) => a.vehicleId)
  }
  return []
}

// Removing a member detaches them from any events they were responsible for (so those
// events fall back to the garage owner on the next planning pass), suppresses their
// still-scheduled reminders for this garage, and deletes the membership (cascading its
// vehicle access).
export async function removeMember(
  tx: Prisma.TransactionClient,
  organizationId: string,
  userId: string,
) {
  await tx.recurringEvent.updateMany({
    where: { organizationId, responsibleUserId: userId },
    data: { responsibleUserId: null },
  })
  await tx.notificationDelivery.updateMany({
    where: { recipientUserId: userId, status: 'SCHEDULED', recurringEvent: { organizationId } },
    data: { status: 'SUPPRESSED', suppressedReason: 'member removed' },
  })
  await tx.garageMembership.deleteMany({ where: { organizationId, userId } })
}
