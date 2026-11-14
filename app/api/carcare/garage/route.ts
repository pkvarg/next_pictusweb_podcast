import { NextResponse } from 'next/server'
import prisma from '@/db/db'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { resolveGarageRole } from '@/lib/carcare/garage'

// GET /api/carcare/garage — members, pending invitations, and the caller's role.
export async function GET() {
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.$transaction(async (tx) => {
    const { role, isLegacyOwner } = await resolveGarageRole(
      tx,
      session.userId,
      session.organizationId!,
    )
    if (role === null) return null

    const memberships = await tx.garageMembership.findMany({
      where: { organizationId: session.organizationId! },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        vehicleAccess: { select: { vehicleId: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    const vehicles = await tx.myVehicle.findMany({
      where: { organizationId: session.organizationId!, deletedAt: null },
      select: { id: true, registration: true, nickname: true, make: true, model: true },
      orderBy: { createdAt: 'asc' },
    })

    const invitations = await tx.garageInvitation.findMany({
      where: {
        organizationId: session.organizationId!,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    const currentUser = await tx.user.findUnique({
      where: { id: session.userId },
      select: { firstName: true, lastName: true, email: true },
    })

    const org = await tx.organization.findUnique({
      where: { id: session.organizationId! },
      select: {
        name: true,
        canCreateBenefit: true,
        isBenefitOrg: true,
        parentOrganizationId: true,
        vehiclesLimit: true,
        notificationsLimit: true,
        currentVehiclesCount: true,
        currentNotificationsCount: true,
        tierRelation: { select: { vehiclesLimit: true, notificationsLimit: true } },
      },
    })

    return { role, isLegacyOwner, memberships, invitations, currentUser, vehicles, org }
  })

  if (!data) return NextResponse.json({ error: 'No access' }, { status: 403 })

  const canManage = data.role === 'OWNER' || data.role === 'ADMIN'
  // Benefit users may only be created by a managing user of a benefit-enabled parent org
  // (never from a benefit sub-org). Mirrors the guard in POST /api/users.
  const canCreateBenefit =
    canManage &&
    !!data.org?.canCreateBenefit &&
    !data.org?.isBenefitOrg &&
    !data.org?.parentOrganizationId

  // Pooled capacity: benefit sub-orgs share the parent's vehicle/notification limits
  // (checkBenefitParentLimit). Surface what's left so the UI can show how many more benefit
  // users can be granted and disable the action when the plan is full.
  let benefitCapacity: { vehiclesLeft: number; notificationsLeft: number } | null = null
  let benefitUsers: Array<{
    subOrgId: string
    userId: string | null
    name: string | null
    email: string | null
    active: boolean
    vehiclesLimit: number | null
    vehiclesUsed: number
    notificationsLimit: number | null
    notificationsUsed: number
  }> = []
  if (canCreateBenefit && data.org) {
    const subOrgs = await prisma.organization.findMany({
      where: {
        parentOrganizationId: session.organizationId!,
        isBenefitOrg: true,
        deletedAt: null,
      },
      select: {
        id: true,
        vehiclesLimit: true,
        notificationsLimit: true,
        currentVehiclesCount: true,
        currentNotificationsCount: true,
        users: {
          select: { id: true, firstName: true, lastName: true, email: true, active: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    const vehiclesLimit = data.org.vehiclesLimit ?? data.org.tierRelation?.vehiclesLimit ?? 0
    const notificationsLimit =
      data.org.notificationsLimit ?? data.org.tierRelation?.notificationsLimit ?? 0
    const usedVehicles =
      data.org.currentVehiclesCount + subOrgs.reduce((s, o) => s + o.currentVehiclesCount, 0)
    const usedNotifications =
      data.org.currentNotificationsCount +
      subOrgs.reduce((s, o) => s + o.currentNotificationsCount, 0)
    benefitCapacity = {
      vehiclesLeft: Math.max(0, vehiclesLimit - usedVehicles),
      notificationsLeft: Math.max(0, notificationsLimit - usedNotifications),
    }
    benefitUsers = subOrgs.map((o) => {
      const u = o.users[0]
      return {
        subOrgId: o.id,
        userId: u?.id ?? null,
        name: u ? [u.firstName, u.lastName].filter(Boolean).join(' ') || null : null,
        email: u?.email ?? null,
        active: u?.active ?? false,
        vehiclesLimit: o.vehiclesLimit,
        vehiclesUsed: o.currentVehiclesCount,
        notificationsLimit: o.notificationsLimit,
        notificationsUsed: o.currentNotificationsCount,
      }
    })
  }

  return NextResponse.json({
    role: data.role,
    canManage,
    canCreateBenefit,
    benefitCapacity,
    benefitUsers,
    organizationId: session.organizationId,
    organizationName: data.org?.name ?? null,
    currentUserId: session.userId,
    members:
      data.isLegacyOwner && data.memberships.length === 0
        ? [
            {
              userId: session.userId,
              role: 'OWNER' as const,
              name:
                [data.currentUser?.firstName, data.currentUser?.lastName]
                  .filter(Boolean)
                  .join(' ') || null,
              email: data.currentUser?.email ?? null,
              isYou: true,
              implicit: true,
              vehicleIds: [],
            },
          ]
        : data.memberships.map((m) => ({
            userId: m.userId,
            role: m.role,
            name: [m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || null,
            email: m.user.email,
            isYou: m.userId === session.userId,
            implicit: false,
            vehicleIds: m.vehicleAccess.map((a) => a.vehicleId),
          })),
    invitations: data.invitations.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      token: i.token,
      expiresAt: i.expiresAt,
    })),
    vehicles: data.vehicles.map((v) => ({
      id: v.id,
      name: v.nickname || [v.make, v.model].filter(Boolean).join(' ') || v.registration,
      registration: v.registration,
    })),
  })
}
