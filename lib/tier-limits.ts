import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
