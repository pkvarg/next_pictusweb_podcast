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
    const existingItem = subscription.items.data[0]

    if (!existingItem) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 500 })
    }

    // Determine proration behavior based on billing interval
    const currentInterval = org.billingInterval || 'monthly'
    const prorationBehavior = currentInterval === 'yearly' ? 'create_prorations' : 'none'

    await stripe.subscriptions.update(org.stripeSubscriptionId, {
      items: [{
        id: existingItem.id,
        price: stripePriceId,
        quantity: vehicleCount,
      }],
      proration_behavior: prorationBehavior as any,
    })

    // Immediately update DB
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        tierId: targetTierRecord.id,
        purchasedVehicles: vehicleCount,
        vehiclesLimit: vehicleCount,
        usersLimit: targetTierRecord.usersLimit,
        notificationsLimit: targetTierRecord.notificationsLimit,
        templatesLimit: targetTierRecord.templatesLimit,
        notificationTypesLimit: targetTierRecord.notificationTypesLimit,
        billingInterval,
        notificationPeriodStart: org.notificationPeriodStart || new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      prorated: currentInterval === 'yearly',
      message: currentInterval === 'yearly'
        ? 'Upgraded to BUSINESS. Prorated charge applied.'
        : 'Upgraded to BUSINESS. New rate starts on next billing cycle.',
    })
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Failed to process upgrade', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
