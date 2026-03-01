import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { stripe, getStripePriceId } from '@/lib/stripe'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationName,
      organizationContact,
      ico,
      dic,
      street,
      city,
      postalCode,
      country,
      tier,
      purchasedVehicles,
      billingInterval,
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
    } = body

    // Validate
    if (!organizationName || !tier || !firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['BASIC', 'BUSINESS'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier for paid checkout' }, { status: 400 })
    }

    if (!['monthly', 'yearly'].includes(billingInterval)) {
      return NextResponse.json({ error: 'Invalid billing interval' }, { status: 400 })
    }

    const vehicleCount = Math.max(1, parseInt(purchasedVehicles) || 1)

    // Check email availability
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Find the tier
    const tierRecord = await prisma.tier.findUnique({
      where: { name: tier },
      select: { id: true },
    })

    if (!tierRecord) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Delete any existing pending onboarding for this email
    await prisma.pendingOnboarding.deleteMany({ where: { email } })

    // Create PendingOnboarding record
    const pending = await prisma.pendingOnboarding.create({
      data: {
        organizationName,
        organizationContact: organizationContact || null,
        ico: ico || null,
        dic: dic || null,
        street: street || null,
        city: city || null,
        postalCode: postalCode || null,
        country: country || null,
        tierId: tierRecord.id,
        purchasedVehicles: vehicleCount,
        billingInterval,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        emailVerified: true,
        phoneVerified: true,
        gdprAccepted: true,
        termsAccepted: true,
        gdprAcceptedAt: new Date(),
        termsAcceptedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    })

    // Get the Stripe price ID
    const stripePriceId = await getStripePriceId(tier, billingInterval)

    // Determine base URL
    const origin = request.headers.get('origin') || 'https://www.pictusweb.sk'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: stripePriceId,
          quantity: vehicleCount,
        },
      ],
      metadata: {
        pendingOnboardingId: pending.id,
      },
      subscription_data: {
        metadata: {
          pendingOnboardingId: pending.id,
        },
      },
      success_url: `${origin}/fleetsync/get-started/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/fleetsync/get-started?tier=${tier}&billing=${billingInterval}&resumed=1`,
    })

    // Update pending record with Stripe session ID
    await prisma.pendingOnboarding.update({
      where: { id: pending.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
