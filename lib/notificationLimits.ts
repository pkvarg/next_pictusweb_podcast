import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface NotificationCheckResult {
  allowed: boolean
  reason?: string
  blocked?: boolean
  limitReached?: boolean
}

/**
 * Sends notification limit reached email via Hono API.
 * Fire-and-forget — does not block the response.
 */
async function sendLimitReachedEmail(params: {
  organizationName: string
  tierName: string
  limit: number
  currentCount: number
  resetDate?: string
  contactEmail?: string
  userEmail?: string
}) {
  try {
    const honoApiUrl = `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/notification-limit`
    await fetch(honoApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    console.log(`[NOTIFICATION-LIMIT] Limit reached email sent for org "${params.organizationName}"`)
  } catch (error) {
    console.error('[NOTIFICATION-LIMIT] Failed to send limit reached email:', error)
  }
}

/**
 * Checks if an organization can create more notifications based on tier limits.
 *
 * FREE tier: lifetime limit. When reached, org is soft-deleted.
 * PREMIUM/BUSINESS: yearly limit from notificationPeriodStart. When reached, notifications are blocked.
 * Year resets lazily on the next check after anniversary.
 *
 * @param organizationId - The organization to check
 * @param countToAdd - How many notifications are about to be created (default 1)
 * @param userEmail - Email of the user attempting to create (for limit email)
 * @returns Whether the notification creation is allowed
 */
export async function checkNotificationLimit(
  organizationId: string,
  countToAdd: number = 1,
  userEmail?: string,
): Promise<NotificationCheckResult> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      tierRelation: {
        select: {
          name: true,
          notificationsLimit: true,
        },
      },
    },
  })

  if (!org) {
    return { allowed: false, reason: 'Organizácia nebola nájdená' }
  }

  if (org.deletedAt) {
    return { allowed: false, reason: 'Organizácia bola deaktivovaná' }
  }

  if (!org.tierRelation) {
    return { allowed: true } // No tier assigned, no limits
  }

  const tierName = org.tierRelation.name.toUpperCase()
  const limit = org.tierRelation.notificationsLimit

  if (tierName === 'FREE') {
    return handleFreeTier(org, limit, countToAdd)
  }

  // PREMIUM and BUSINESS - yearly tracking
  return handlePaidTier(org, limit, countToAdd, tierName, userEmail)
}

async function handleFreeTier(
  org: any,
  limit: number,
  countToAdd: number,
): Promise<NotificationCheckResult> {
  const currentCount = org.currentNotificationsCount

  if (currentCount + countToAdd > limit) {
    // Soft-delete the organization
    await prisma.organization.update({
      where: { id: org.id },
      data: { deletedAt: new Date() },
    })

    console.log(
      `[NOTIFICATION-LIMIT] FREE org "${org.name}" (${org.id}) reached limit ${limit}. Organization deactivated.`,
    )

    return {
      allowed: false,
      limitReached: true,
      reason: `Dosiahli ste limit ${limit} notifikácií pre FREE tier. Organizácia bola deaktivovaná. Kontaktujte administrátora pre upgrade.`,
    }
  }

  return { allowed: true }
}

async function handlePaidTier(
  org: any,
  limit: number,
  countToAdd: number,
  tierName: string,
  userEmail?: string,
): Promise<NotificationCheckResult> {
  const now = new Date()
  let periodStart = org.notificationPeriodStart
    ? new Date(org.notificationPeriodStart)
    : new Date(org.createdAt)

  // Check if we need to reset the yearly period
  const periodEnd = new Date(periodStart)
  periodEnd.setFullYear(periodEnd.getFullYear() + 1)

  if (now >= periodEnd) {
    // Year has passed - reset the period and unblock
    // Move periodStart forward by full years until it's within the current year
    while (periodEnd <= now) {
      periodStart.setFullYear(periodStart.getFullYear() + 1)
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    await prisma.organization.update({
      where: { id: org.id },
      data: {
        notificationPeriodStart: periodStart,
        notificationsBlocked: false,
      },
    })

    console.log(
      `[NOTIFICATION-LIMIT] ${tierName} org "${org.name}" (${org.id}) yearly period reset. New period start: ${periodStart.toISOString()}`,
    )

    // After reset, count is maintained by the DB trigger counting active notifications.
    // We allow creation since the period just reset.
    return { allowed: true }
  }

  // Check if blocked
  if (org.notificationsBlocked) {
    const resetDate = periodEnd.toLocaleDateString('sk-SK')
    return {
      allowed: false,
      blocked: true,
      reason: `Dosiahli ste ročný limit ${limit} notifikácií pre ${tierName} tier. Limit sa obnoví ${resetDate}. Kontaktujte administrátora.`,
    }
  }

  // Check if adding would exceed limit
  const currentCount = org.currentNotificationsCount
  if (currentCount + countToAdd > limit) {
    // Block notifications and set period start if not set
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        notificationsBlocked: true,
        notificationPeriodStart: org.notificationPeriodStart || org.createdAt,
      },
    })

    console.log(
      `[NOTIFICATION-LIMIT] ${tierName} org "${org.name}" (${org.id}) reached yearly limit ${limit}. Notifications blocked.`,
    )

    // Calculate reset date for the email
    const emailPeriodStart = org.notificationPeriodStart
      ? new Date(org.notificationPeriodStart)
      : new Date(org.createdAt)
    const emailPeriodEnd = new Date(emailPeriodStart)
    emailPeriodEnd.setFullYear(emailPeriodEnd.getFullYear() + 1)

    // Fire-and-forget email to admin + user
    sendLimitReachedEmail({
      organizationName: org.name,
      tierName,
      limit,
      currentCount,
      resetDate: emailPeriodEnd.toLocaleDateString('sk-SK'),
      contactEmail: org.mainContact || undefined,
      userEmail,
    })

    return {
      allowed: false,
      limitReached: true,
      reason: `Dosiahli ste ročný limit ${limit} notifikácií pre ${tierName} tier. Kontaktujte administrátora.`,
    }
  }

  // Ensure notificationPeriodStart is set
  if (!org.notificationPeriodStart) {
    await prisma.organization.update({
      where: { id: org.id },
      data: { notificationPeriodStart: org.createdAt },
    })
  }

  return { allowed: true }
}
