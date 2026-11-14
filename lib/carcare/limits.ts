import { Prisma } from '@prisma/client'

export type LimitedResource = 'vehicles' | 'users' | 'notifications'

export class TierLimitError extends Error {
  constructor(
    public resource: LimitedResource,
    public limit: number,
  ) {
    super(`${resource}_limit_reached`)
    this.name = 'TierLimitError'
  }
}

const MESSAGES: Record<string, Record<LimitedResource, string>> = {
  sk: {
    vehicles: 'Dosiahli ste limit vozidiel vo vašom pláne ({limit}). Prejdite na vyšší plán.',
    users: 'Dosiahli ste limit používateľov vo vašom pláne ({limit}). Prejdite na vyšší plán.',
    notifications: 'Dosiahli ste limit notifikácií vo vašom pláne ({limit}).',
  },
  en: {
    vehicles: "You've reached your plan's vehicle limit ({limit}). Upgrade to add more.",
    users: "You've reached your plan's user limit ({limit}). Upgrade to add more.",
    notifications: "You've reached your plan's notification limit ({limit}).",
  },
  hu: {
    vehicles: 'Elérte a csomag járműlimitjét ({limit}). Váltson magasabb csomagra.',
    users: 'Elérte a csomag felhasználói limitjét ({limit}). Váltson magasabb csomagra.',
    notifications: 'Elérte a csomag értesítési limitjét ({limit}).',
  },
}

export function limitMessage(err: TierLimitError, locale = 'sk'): string {
  const loc = MESSAGES[locale] ? locale : 'sk'
  return MESSAGES[loc][err.resource].replace('{limit}', String(err.limit))
}

// SMS is a paid-plan channel: BASIC and BUSINESS only (FREE is blocked). Untiered
// organizations (legacy / tests) keep their previous behaviour.
const SMS_TIERS = new Set(['BASIC', 'BUSINESS'])
export function smsAllowedForTier(tierName: string | null | undefined): boolean {
  if (!tierName) return true
  return SMS_TIERS.has(tierName.toUpperCase())
}

// Effective limit = org override ?? tier limit; null means unlimited (no tier, no override).
// A benefit sub-org's vehicles draw from its parent's shared pool: parent usage plus every
// active benefit sub-org's usage, against the parent/tier limit. Mirrors checkBenefitParentLimit
// so the CarCare createVehicle path enforces the pool just like the /api/my-vehicles route.
async function assertBenefitParentVehicleCapacity(
  tx: Prisma.TransactionClient,
  parentOrganizationId: string,
): Promise<void> {
  const parent = await tx.organization.findUnique({
    where: { id: parentOrganizationId },
    select: {
      vehiclesLimit: true,
      currentVehiclesCount: true,
      tierRelation: { select: { vehiclesLimit: true } },
    },
  })
  if (!parent) return
  const limit = parent.vehiclesLimit ?? parent.tierRelation?.vehiclesLimit ?? null
  if (limit == null) return
  const subs = await tx.organization.findMany({
    where: { parentOrganizationId, isBenefitOrg: true, deletedAt: null },
    select: { currentVehiclesCount: true },
  })
  const total = parent.currentVehiclesCount + subs.reduce((s, o) => s + o.currentVehiclesCount, 0)
  if (total >= limit) {
    throw new TierLimitError('vehicles', limit)
  }
}

export async function assertVehicleCapacity(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<void> {
  const org = await tx.organization.findUnique({
    where: { id: organizationId },
    select: {
      vehiclesLimit: true,
      currentVehiclesCount: true,
      isBenefitOrg: true,
      parentOrganizationId: true,
      tierRelation: { select: { vehiclesLimit: true } },
    },
  })
  if (!org) return

  // Benefit sub-org: enforce its optional own cap (Option B — null means no cap), then the
  // parent's shared pool ceiling.
  if (org.isBenefitOrg && org.parentOrganizationId) {
    if (org.vehiclesLimit !== null && org.currentVehiclesCount >= org.vehiclesLimit) {
      throw new TierLimitError('vehicles', org.vehiclesLimit)
    }
    await assertBenefitParentVehicleCapacity(tx, org.parentOrganizationId)
    return
  }

  const limit = org.vehiclesLimit ?? org.tierRelation?.vehiclesLimit ?? null
  if (limit != null && org.currentVehiclesCount >= limit) {
    throw new TierLimitError('vehicles', limit)
  }
}

// Counts active users plus still-open invitations, so invites can't overshoot the plan.
export async function assertUserCapacity(
  tx: Prisma.TransactionClient,
  organizationId: string,
): Promise<void> {
  const org = await tx.organization.findUnique({
    where: { id: organizationId },
    select: {
      usersLimit: true,
      currentUsersCount: true,
      tierRelation: { select: { usersLimit: true } },
    },
  })
  if (!org) return
  const limit = org.usersLimit ?? org.tierRelation?.usersLimit ?? null
  if (limit == null) return
  const pending = await tx.garageInvitation.count({
    where: { organizationId, status: 'PENDING' },
  })
  if (org.currentUsersCount + pending >= limit) {
    throw new TierLimitError('users', limit)
  }
}
