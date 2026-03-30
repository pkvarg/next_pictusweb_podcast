import prisma from '@/db/db'
import { isExpired, SubscriptionRequiredError } from './subscription-status'

/**
 * Throws SubscriptionRequiredError if the org's free trial has expired
 * and they have no active subscription.
 */
export async function requireActiveSubscription(organizationId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { freeTrialEndDate: true, stripeSubscriptionStatus: true },
  })

  if (!org) {
    throw new Error('Organization not found')
  }

  if (isExpired(org)) {
    throw new SubscriptionRequiredError()
  }
}
