import prisma from '@/db/db';
import { isExpired, SubscriptionRequiredError } from './subscription-status';

export class TierLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TierLimitError';
  }
}

export type LimitType = 'users' | 'vehicles' | 'notifications' | 'templates' | 'notificationTypes';

export async function checkTierLimit(
  organizationId: string,
  limitType: LimitType
): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { tierRelation: true }
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  // Block resource creation if free trial has expired
  if (isExpired(org)) {
    throw new SubscriptionRequiredError();
  }

  // Benefit org: delegate vehicles/notifications to parent's pool
  if (org.isBenefitOrg && org.parentOrganizationId) {
    if (limitType === 'vehicles' || limitType === 'notifications') {
      await checkBenefitParentLimit(org.parentOrganizationId, limitType);
      return;
    }
    if (limitType === 'templates' || limitType === 'notificationTypes') {
      // Inherited from parent — check against parent's limits
      await checkTierLimit(org.parentOrganizationId, limitType);
      return;
    }
    // 'users' — check against sub-org's own limit (usually 1)
  }

  // If organization has no tier and no org-level limits, skip limit check
  if (!org.tierRelation && org.usersLimit === null && org.vehiclesLimit === null) {
    console.log(`[checkTierLimit] Organization ${organizationId} has no tier or limits, skipping limit check`);
    return;
  }

  const limitMap = {
    users: {
      current: org.currentUsersCount,
      limit: org.usersLimit ?? org.tierRelation?.usersLimit ?? Infinity
    },
    vehicles: {
      current: org.currentVehiclesCount,
      limit: org.vehiclesLimit ?? org.tierRelation?.vehiclesLimit ?? Infinity
    },
    notifications: {
      current: org.currentNotificationsCount,
      limit: org.notificationsLimit ?? org.tierRelation?.notificationsLimit ?? Infinity
    },
    templates: {
      current: org.currentTemplatesCount,
      limit: org.templatesLimit ?? org.tierRelation?.templatesLimit ?? Infinity
    },
    notificationTypes: {
      current: org.currentNotificationTypesCount,
      limit: org.notificationTypesLimit ?? org.tierRelation?.notificationTypesLimit ?? Infinity
    }
  };

  const { current, limit } = limitMap[limitType];

  if (current >= limit) {
    throw new TierLimitError(
      `Organization has reached the limit for ${limitType}. Current: ${current}, Limit: ${limit}. Please upgrade your tier.`
    );
  }
}

/**
 * For benefit orgs: check vehicles/notifications against the parent's total pool.
 * Sums parent's own usage + all active benefit sub-orgs' usage.
 */
async function checkBenefitParentLimit(
  parentOrgId: string,
  limitType: 'vehicles' | 'notifications'
): Promise<void> {
  const parentOrg = await prisma.organization.findUnique({
    where: { id: parentOrgId },
    include: { tierRelation: true }
  });

  if (!parentOrg) {
    throw new Error('Parent organization not found');
  }

  const countField = limitType === 'vehicles' ? 'currentVehiclesCount' : 'currentNotificationsCount';
  const limitField = limitType === 'vehicles' ? 'vehiclesLimit' : 'notificationsLimit';

  // Sum usage from all active benefit sub-orgs
  const benefitSubOrgs = await prisma.organization.findMany({
    where: {
      parentOrganizationId: parentOrgId,
      isBenefitOrg: true,
      deletedAt: null,
    },
    select: { [countField]: true } as any,
  });

  const parentUsage = parentOrg[countField];
  const benefitUsage = benefitSubOrgs.reduce((sum: number, sub: any) => sum + (sub[countField] || 0), 0);
  const totalUsage = parentUsage + benefitUsage;

  const limit = parentOrg[limitField] ?? (parentOrg.tierRelation as any)?.[`${limitType}Limit`] ?? Infinity;

  if (totalUsage >= limit) {
    throw new TierLimitError(
      `Parent organization has reached the pooled limit for ${limitType}. Total usage: ${totalUsage}, Limit: ${limit}. Please upgrade your tier.`
    );
  }
}

export async function getOrganizationLimits(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { tierRelation: true }
  });

  if (!org) {
    return null;
  }

  const usersLimit = org.usersLimit ?? org.tierRelation?.usersLimit ?? 0;
  const vehiclesLimit = org.vehiclesLimit ?? org.tierRelation?.vehiclesLimit ?? 0;
  const notificationsLimit = org.notificationsLimit ?? org.tierRelation?.notificationsLimit ?? 0;
  const templatesLimit = org.templatesLimit ?? org.tierRelation?.templatesLimit ?? 0;
  const notificationTypesLimit = org.notificationTypesLimit ?? org.tierRelation?.notificationTypesLimit ?? 0;

  return {
    tierName: org.tierRelation?.name ?? 'N/A',
    users: {
      current: org.currentUsersCount,
      limit: usersLimit,
      remaining: usersLimit - org.currentUsersCount,
      percentage: usersLimit > 0 ? Math.round((org.currentUsersCount / usersLimit) * 100) : 0
    },
    vehicles: {
      current: org.currentVehiclesCount,
      limit: vehiclesLimit,
      remaining: vehiclesLimit - org.currentVehiclesCount,
      percentage: vehiclesLimit > 0 ? Math.round((org.currentVehiclesCount / vehiclesLimit) * 100) : 0
    },
    notifications: {
      current: org.currentNotificationsCount,
      limit: notificationsLimit,
      remaining: notificationsLimit - org.currentNotificationsCount,
      percentage: notificationsLimit > 0 ? Math.round((org.currentNotificationsCount / notificationsLimit) * 100) : 0
    },
    templates: {
      current: org.currentTemplatesCount,
      limit: templatesLimit,
      remaining: templatesLimit - org.currentTemplatesCount,
      percentage: templatesLimit > 0 ? Math.round((org.currentTemplatesCount / templatesLimit) * 100) : 0
    },
    notificationTypes: {
      current: org.currentNotificationTypesCount,
      limit: notificationTypesLimit,
      remaining: notificationTypesLimit - org.currentNotificationTypesCount,
      percentage: notificationTypesLimit > 0 ? Math.round((org.currentNotificationTypesCount / notificationTypesLimit) * 100) : 0
    }
  };
}

export async function canCreateResource(
  organizationId: string,
  limitType: LimitType
): Promise<boolean> {
  try {
    await checkTierLimit(organizationId, limitType);
    return true;
  } catch (error) {
    if (error instanceof TierLimitError) {
      return false;
    }
    throw error;
  }
}
