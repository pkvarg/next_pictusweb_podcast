import prisma from '@/db/db'

interface OrgForExpiredCheck {
  freeTrialEndDate: Date | null
  stripeSubscriptionStatus: string | null
}

/**
 * Returns true if the org's free trial has expired and they have no active subscription.
 * During the free/gifted period (freeTrialEndDate in the future), returns false — no restrictions.
 */
export function isExpired(org: OrgForExpiredCheck): boolean {
  return (
    org.freeTrialEndDate !== null &&
    org.freeTrialEndDate < new Date() &&
    (!org.stripeSubscriptionStatus || org.stripeSubscriptionStatus === 'canceled')
  )
}

export class SubscriptionRequiredError extends Error {
  constructor() {
    super('Your free period has ended. Please subscribe to continue.')
    this.name = 'SubscriptionRequiredError'
  }
}
