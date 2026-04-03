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

    const { vehicleCount } = await request.json()
    const newCount = Math.max(1, parseInt(vehicleCount) || 1)

    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      include: { tierRelation: true },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const tierName = org.tierRelation?.name || 'FREE'

    if (tierName === 'FREE') {
      return NextResponse.json({ error: 'Free tier cannot change vehicle count' }, { status: 400 })
    }

    if (!org.stripeSubscriptionId || !org.billingInterval) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    // Block yearly subscribers
    if (org.billingInterval === 'yearly') {
      return NextResponse.json({ error: 'Yearly subscribers must contact support.' }, { status: 400 })
    }

    // Enforce tier vehicle limits
    const currentCount = org.purchasedVehicles || 1
    const maxVehicles = tierName === 'BASIC' ? 3 : Math.min(999, currentCount * 2)
    if (newCount > maxVehicles) {
      const msg = tierName === 'BASIC'
        ? `Maximum ${maxVehicles} vehicles for BASIC`
        : `Maximum increase is 2× your current count (${currentCount} → ${maxVehicles}). Contact support for larger changes.`
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (newCount === org.purchasedVehicles) {
      return NextResponse.json({ error: 'Vehicle count unchanged' }, { status: 400 })
    }

    // Block reducing below actual vehicle count
    const actualVehicles = await prisma.vehicle.count({
      where: { organizationId: org.id, deletedAt: null },
    })
    if (newCount < actualVehicles) {
      return NextResponse.json({
        error: `You have ${actualVehicles} active vehicles. Delete some before reducing below that.`,
      }, { status: 400 })
    }

    // Update Stripe subscription quantity — no proration, kicks in next cycle
    const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId)
    const existingItem = subscription.items.data[0]

    if (!existingItem) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 500 })
    }

    await stripe.subscriptions.update(org.stripeSubscriptionId, {
      items: [{
        id: existingItem.id,
        quantity: newCount,
      }],
      proration_behavior: 'none' as any,
    })

    // Update DB
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        purchasedVehicles: newCount,
        vehiclesLimit: newCount,
      },
    })

    return NextResponse.json({
      success: true,
      purchasedVehicles: newCount,
      message: 'Vehicle count updated. New rate starts on next billing cycle.',
    })
  } catch (error) {
    console.error('Update vehicles error:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle count', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
