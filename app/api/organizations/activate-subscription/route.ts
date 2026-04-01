import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { stripe, getStripePriceId } from '@/lib/stripe'
import { isExpired } from '@/lib/subscription-status'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { billingInterval, purchasedVehicles, locale } = body

    if (!['monthly', 'yearly'].includes(billingInterval)) {
      return NextResponse.json({ error: 'Invalid billing interval' }, { status: 400 })
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      include: { tierRelation: true },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Must be in expired state
    if (!isExpired(org)) {
      return NextResponse.json({ error: 'Organization is not in expired state' }, { status: 400 })
    }

    // Determine tier: use freeTrialTierId, fall back to current tierId
    const tierName = org.freeTrialTierId
      ? (await prisma.tier.findUnique({ where: { id: org.freeTrialTierId }, select: { name: true } }))?.name
      : org.tierRelation?.name

    if (!tierName || tierName === 'FREE') {
      return NextResponse.json({ error: 'No paid tier to activate' }, { status: 400 })
    }

    const vehicleCount = Math.max(1, parseInt(purchasedVehicles) || org.purchasedVehicles || 1)
    const stripePriceId = await getStripePriceId(tierName, billingInterval)

    // Create or reuse Stripe Customer
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

    const origin = request.headers.get('origin') || 'https://www.pictusweb.sk'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: stripePriceId, quantity: vehicleCount }],
      metadata: {
        activateOrganizationId: org.id,
        billingInterval,
        purchasedVehicles: String(vehicleCount),
        locale: locale || 'sk',
      },
      subscription_data: {
        metadata: { organizationId: org.id },
      },
      success_url: `${origin}/client/activate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/client/activate?canceled=1`,
    })

    return NextResponse.json({ checkoutUrl: checkoutSession.url })
  } catch (error) {
    console.error('Activate subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
