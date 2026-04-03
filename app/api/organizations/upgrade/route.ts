import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { stripe, getStripePriceId } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetTier, billingInterval, purchasedVehicles, locale: reqLocale } = body

    // Validate inputs
    if (!['BASIC', 'BUSINESS'].includes(targetTier)) {
      return NextResponse.json({ error: 'Invalid target tier' }, { status: 400 })
    }
    if (!['monthly', 'yearly'].includes(billingInterval)) {
      return NextResponse.json({ error: 'Invalid billing interval' }, { status: 400 })
    }

    const vehicleCount = Math.max(1, parseInt(purchasedVehicles) || 1)

    // Fetch org with current tier
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      include: { tierRelation: true },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const currentTierName = org.tierRelation?.name || 'FREE'

    // Validate upgrade path
    const validPaths: Record<string, string[]> = {
      FREE: ['BASIC', 'BUSINESS'],
      BASIC: ['BUSINESS'],
    }

    if (!validPaths[currentTierName]?.includes(targetTier)) {
      return NextResponse.json({ error: `Cannot upgrade from ${currentTierName} to ${targetTier}` }, { status: 400 })
    }

    // Block if subscription is past_due
    if (org.stripeSubscriptionStatus === 'past_due') {
      return NextResponse.json({ error: 'Please fix your payment method before upgrading' }, { status: 400 })
    }

    // Get target tier record
    const targetTierRecord = await prisma.tier.findUnique({
      where: { name: targetTier },
    })

    if (!targetTierRecord) {
      return NextResponse.json({ error: 'Target tier not found' }, { status: 400 })
    }

    const stripePriceId = await getStripePriceId(targetTier, billingInterval)
    const origin = request.headers.get('origin') || 'https://www.pictusweb.sk'
    const locale = reqLocale || 'sk'

    // CASE: FREE -> paid (new subscription via Checkout)
    if (currentTierName === 'FREE' || !org.stripeSubscriptionId) {
      // Cancel existing subscription if any (e.g. upgrading before webhook sets subscriptionId)
      if (org.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(org.stripeSubscriptionId, { prorate: true, invoice_now: true })
          console.log('Canceled old subscription (prorated credit):', org.stripeSubscriptionId)
        } catch (err) {
          console.error('Failed to cancel old subscription:', err)
        }
      }

      // Create Stripe Customer if needed
      let customerId = org.stripeCustomerId
      if (!customerId) {
        const user = await prisma.user.findFirst({
          where: { organizationId: org.id },
          select: { email: true },
        })
        const customer = await stripe.customers.create({
          email: user?.email || undefined,
          metadata: { organizationId: org.id },
        })
        customerId = customer.id
        await prisma.organization.update({
          where: { id: org.id },
          data: { stripeCustomerId: customerId },
        })
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: stripePriceId, quantity: vehicleCount }],
        metadata: {
          upgradeOrganizationId: org.id,
          targetTierId: targetTierRecord.id,
          purchasedVehicles: String(vehicleCount),
          billingInterval,
          locale,
        },
        subscription_data: {
          metadata: { organizationId: org.id },
        },
        success_url: `${origin}/${locale}/client/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/${locale}/client/upgrade?canceled=1`,
      })

      return NextResponse.json({ checkoutUrl: checkoutSession.url })
    }

    // CASE: BASIC -> BUSINESS (existing subscription)
    const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId)

    // If old subscription is no longer active, cancel it and go through checkout
    if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      try { await stripe.subscriptions.cancel(org.stripeSubscriptionId) } catch {}
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: org.stripeCustomerId!,
        line_items: [{ price: stripePriceId, quantity: vehicleCount }],
        metadata: {
          upgradeOrganizationId: org.id,
          targetTierId: targetTierRecord.id,
          purchasedVehicles: String(vehicleCount),
          billingInterval,
          locale,
        },
        subscription_data: {
          metadata: { organizationId: org.id },
        },
        success_url: `${origin}/${locale}/client/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/${locale}/client/upgrade?canceled=1`,
      })
      return NextResponse.json({ checkoutUrl: checkoutSession.url })
    }

    const existingItem = subscription.items.data[0]

    if (!existingItem) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 500 })
    }

    // Reject yearly subscribers — must contact support for upgrade
    const currentInterval = org.billingInterval || 'monthly'
    if (currentInterval === 'yearly') {
      return NextResponse.json({ error: 'Yearly subscribers must contact support to upgrade.' }, { status: 400 })
    }

    // Reject billing interval changes (UI prevents this, but enforce server-side)
    if (currentInterval !== billingInterval) {
      return NextResponse.json({ error: 'Cannot change billing interval. Contact support.' }, { status: 400 })
    }

    // Allow vehicle count change during upgrade, capped at 100
    const newVehicles = Math.min(100, Math.max(1, vehicleCount))

    // Update subscription in-place — new price + quantity kicks in at next billing cycle
    await stripe.subscriptions.update(org.stripeSubscriptionId, {
      items: [{
        id: existingItem.id,
        price: stripePriceId,
        quantity: newVehicles,
      }],
      proration_behavior: 'none' as any,
    })

    // Immediately update DB
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        tierId: targetTierRecord.id,
        purchasedVehicles: newVehicles,
        vehiclesLimit: newVehicles,
        usersLimit: targetTierRecord.usersLimit,
        notificationsLimit: targetTierRecord.notificationsLimit,
        templatesLimit: targetTierRecord.templatesLimit,
        notificationTypesLimit: targetTierRecord.notificationTypesLimit,
        currentNotificationsCount: 0,
        notificationPeriodStart: new Date(),
        notificationsBlocked: false,
      },
    })

    // Send upgrade email (fire-and-forget)
    const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL
    const appUrl = process.env.NEXTAUTH_URL || 'https://www.pictusweb.sk'
    const upgradeUser = await prisma.user.findFirst({
      where: { organizationId: org.id },
      select: { email: true, firstName: true },
    })
    if (upgradeUser?.email) {
      fetch(`${honoApi}/api/pictusweb/client/send-upgrade-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: upgradeUser.email,
          firstName: upgradeUser.firstName || '',
          tierName: targetTierRecord.name,
          billingInterval: currentInterval,
          vehicleCount: newVehicles,
          loginUrl: `${appUrl}/${locale}/client`,
          locale,
        }),
      }).catch((err) => console.error('In-place upgrade email failed:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Upgraded to BUSINESS. New rate starts on next billing cycle.',
    })
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Failed to process upgrade', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
