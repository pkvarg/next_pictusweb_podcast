import prisma from '@/db/db'
import { prodLogger } from '@/lib/prodLogger'

export type OnboardingResult =
  | { status: 'created'; userId: string; organizationId: string; email: string }
  | { status: 'already_exists'; email: string }
  | { status: 'pending_not_found'; pendingId: string }
  | { status: 'error'; error: string }

interface CompleteOnboardingParams {
  pendingId: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  parentOrganizationId?: string | null
  onboardedBy?: string | null
  locale?: string
  source: 'webhook' | 'success_page' | string
}

/**
 * Creates the Organization + User from a pendingOnboarding record after a paid
 * checkout. Idempotent and safe to call from both the Stripe webhook and the
 * checkout success page (self-healing if the webhook is delayed or fails).
 */
export async function completePaidOnboarding(
  params: CompleteOnboardingParams,
): Promise<OnboardingResult> {
  const { pendingId, stripeCustomerId, stripeSubscriptionId, source } = params

  try {
    const pending = await prisma.pendingOnboarding.findUnique({
      where: { id: pendingId },
      include: { tier: true },
    })

    if (!pending) {
      prodLogger.warn('[ONBOARDING] pending record not found (may already be consumed)', {
        pendingId,
        source,
      })
      return { status: 'pending_not_found', pendingId }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: pending.email },
      select: { id: true },
    })

    if (existingUser) {
      await prisma.pendingOnboarding.delete({ where: { id: pendingId } }).catch(() => {})
      return { status: 'already_exists', email: pending.email }
    }

    const tier = pending.tier
    const parentOrganizationId = params.parentOrganizationId || null
    const onboardedBy = params.onboardedBy || pending.email

    let organizationId = ''
    let userId = ''

    try {
      await prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: pending.organizationName,
            mainContact: pending.organizationContact,
            ico: pending.ico,
            dic: pending.dic,
            street: pending.street,
            city: pending.city,
            postalCode: pending.postalCode,
            country: pending.country,
            tierId: pending.tierId,
            parentOrganizationId: parentOrganizationId || null,
            onboardedBy,
            notificationPeriodStart: new Date(),
            purchasedVehicles: pending.purchasedVehicles,
            usersLimit: tier.usersLimit,
            vehiclesLimit: pending.purchasedVehicles,
            notificationsLimit: tier.notificationsLimit,
            templatesLimit: tier.templatesLimit,
            notificationTypesLimit: tier.notificationTypesLimit,
            stripeCustomerId: stripeCustomerId,
            stripeSubscriptionId: stripeSubscriptionId,
            stripeSubscriptionStatus: 'active',
            billingInterval: pending.billingInterval,
            subscriptionStartDate: new Date(),
          },
        })
        organizationId = organization.id

        const user = await tx.user.create({
          data: {
            firstName: pending.firstName,
            lastName: pending.lastName,
            email: pending.email,
            password: pending.password, // Already hashed
            phoneNumber: pending.phoneNumber,
            role: 'CLIENT',
            active: true,
            organizationId: organization.id,
            isFleetManager: true,
            loginProvider: 'credentials',
            emailVerified: new Date(),
            phoneVerified: new Date(),
          },
        })
        userId = user.id
      })
    } catch (txError) {
      // Concurrent creation (e.g. webhook + success page racing): the unique
      // email constraint means the other path already created the account.
      if ((txError as { code?: string })?.code === 'P2002') {
        await prisma.pendingOnboarding.delete({ where: { id: pendingId } }).catch(() => {})
        return { status: 'already_exists', email: pending.email }
      }
      throw txError
    }

    await prisma.pendingOnboarding.delete({ where: { id: pendingId } }).catch(() => {})

    prodLogger.warn('[ONBOARDING] paid account created', {
      source,
      email: pending.email,
      userId,
      organizationId,
    })

    sendWelcomeEmail(pending, onboardedBy, tier?.name, params.locale)

    return { status: 'created', userId, organizationId, email: pending.email }
  } catch (error) {
    prodLogger.error(
      '[ONBOARDING_ALERT] failed to complete paid onboarding for a paying customer',
      {
        pendingId,
        source,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    )
    return { status: 'error', error: error instanceof Error ? error.message : String(error) }
  }
}

function sendWelcomeEmail(
  pending: { email: string; firstName: string | null },
  onboardedBy: string,
  tierName: string | undefined,
  locale: string | undefined,
) {
  const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL
  const appUrl = process.env.NEXTAUTH_URL || 'https://www.pictusweb.sk'
  const loc = locale || 'sk'
  const isSelfSignup = onboardedBy === pending.email

  if (isSelfSignup) {
    fetch(`${honoApi}/api/pictusweb/client/send-free-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pending.email,
        firstName: pending.firstName,
        loginUrl: `${appUrl}/${loc}/client`,
        tierName: tierName,
        locale: loc,
      }),
    }).catch((err) =>
      prodLogger.error('[ONBOARDING] welcome email failed', {
        email: pending.email,
        error: String(err),
      }),
    )
  } else {
    fetch(`${honoApi}/api/pictusweb/client/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pending.email,
        firstName: pending.firstName,
        agentName: onboardedBy,
        agentEmail: onboardedBy,
        loginUrl: `${appUrl}/${loc}/auth/login`,
        gdprUrl: `${appUrl}/gdpr`,
        termsUrl: `${appUrl}/obchodne-podmienky`,
        locale: loc,
      }),
    }).catch((err) =>
      prodLogger.error('[ONBOARDING] welcome email failed', {
        email: pending.email,
        error: String(err),
      }),
    )
  }
}
