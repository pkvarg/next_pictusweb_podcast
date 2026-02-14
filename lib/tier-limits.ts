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

  // If organization has no tier assigned, skip limit check (no limits)
  if (!org.tierRelation) {
    console.log(`[checkTierLimit] Organization ${organizationId} has no tier, skipping limit check`);
    return;
  }

  const limitMap = {
    users: {
      current: org.currentUsersCount,
      limit: org.tierRelation.usersLimit
    },
    vehicles: {
      current: org.currentVehiclesCount,
      limit: org.tierRelation.vehiclesLimit
    },
    notifications: {
      current: org.currentNotificationsCount,
      limit: org.tierRelation.notificationsLimit
    },
    templates: {
      current: org.currentTemplatesCount,
      limit: org.tierRelation.templatesLimit
    },
    notificationTypes: {
      current: org.currentNotificationTypesCount,
      limit: org.tierRelation.notificationTypesLimit
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

  if (!org || !org.tierRelation) {
    return null;
  }

  return {
    tierName: org.tierRelation.name,
    users: {
      current: org.currentUsersCount,
      limit: org.tierRelation.usersLimit,
      remaining: org.tierRelation.usersLimit - org.currentUsersCount,
      percentage: Math.round((org.currentUsersCount / org.tierRelation.usersLimit) * 100)
    },
    vehicles: {
      current: org.currentVehiclesCount,
      limit: org.tierRelation.vehiclesLimit,
      remaining: org.tierRelation.vehiclesLimit - org.currentVehiclesCount,
      percentage: Math.round((org.currentVehiclesCount / org.tierRelation.vehiclesLimit) * 100)
    },
    notifications: {
      current: org.currentNotificationsCount,
      limit: org.tierRelation.notificationsLimit,
      remaining: org.tierRelation.notificationsLimit - org.currentNotificationsCount,
      percentage: Math.round((org.currentNotificationsCount / org.tierRelation.notificationsLimit) * 100)
    },
    templates: {
      current: org.currentTemplatesCount,
      limit: org.tierRelation.templatesLimit,
      remaining: org.tierRelation.templatesLimit - org.currentTemplatesCount,
      percentage: Math.round((org.currentTemplatesCount / org.tierRelation.templatesLimit) * 100)
    },
    notificationTypes: {
      current: org.currentNotificationTypesCount,
      limit: org.tierRelation.notificationTypesLimit,
      remaining: org.tierRelation.notificationTypesLimit - org.currentNotificationTypesCount,
      percentage: Math.round((org.currentNotificationTypesCount / org.tierRelation.notificationTypesLimit) * 100)
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
