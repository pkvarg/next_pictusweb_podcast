import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { stripe, getStripePriceId } from '@/lib/stripe'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is from PICTUSACI organization
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organizationRelation: {
          select: {
            name: true
          }
        }
      }
    })

    if (currentUser?.organizationRelation?.name !== 'PICTUSACI') {
      return NextResponse.json({ error: 'Forbidden - Only PICTUSACI users can onboard clients' }, { status: 403 })
    }

    const body = await request.json()
    const {
      // Organization data
      organizationName,
      organizationMainContact,
      ico,
      dic,
      street,
      city,
      postalCode,
      country,
      tierId,
      purchasedVehicles,
      // Optional limit overrides
      usersLimit: usersLimitOverride,
      vehiclesLimit: vehiclesLimitOverride,
      notificationsLimit: notificationsLimitOverride,
      templatesLimit: templatesLimitOverride,
      notificationTypesLimit: notificationTypesLimitOverride,
      // New user data
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      isFleetManager,
      // Payment
      billingInterval,
      requirePayment
    } = body

    // Validate required fields
    if (!organizationName || !tierId) {
      return NextResponse.json({ error: 'Organization name and tier are required' }, { status: 400 })
    }

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'First name, last name, email, and password are required' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Fetch tier for defaults and to determine if notificationPeriodStart should be set
    const tier = await prisma.tier.findUnique({
      where: { id: tierId },
    })
    const tierName = tier?.name?.toUpperCase() || ''
    const isPaidTier = tierName === 'BASIC' || tierName === 'BUSINESS'

    // --- Stripe checkout path ---
    if (requirePayment && isPaidTier) {
      if (!billingInterval || !['monthly', 'yearly'].includes(billingInterval)) {
        return NextResponse.json({ error: 'Invalid billing interval' }, { status: 400 })
      }

      const vehicleCount = Math.max(1, parseInt(purchasedVehicles) || 1)
      const hashedPassword = await bcrypt.hash(password, 10)

      // Delete any existing pending onboarding for this email
      await prisma.pendingOnboarding.deleteMany({ where: { email } })

      // Create PendingOnboarding record
      const pending = await prisma.pendingOnboarding.create({
        data: {
          organizationName,
          organizationContact: organizationMainContact || null,
          ico: ico || null,
          dic: dic || null,
          street: street || null,
          city: city || null,
          postalCode: postalCode || null,
          country: country || null,
          tierId,
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      // Get Stripe price ID
      const stripePriceId = await getStripePriceId(tierName, billingInterval)

      const origin = request.headers.get('origin') || 'https://www.pictusweb.sk'

      // Create Stripe Checkout Session
      const checkoutSession = await stripe.checkout.sessions.create({
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
          parentOrganizationId: currentUser?.organizationId || '',
          onboardedBy: session.user.email || '',
        },
        subscription_data: {
          metadata: {
            pendingOnboardingId: pending.id,
          },
        },
        success_url: `${origin}/client/my-fleet?tab=organizations&onboarded=success`,
        cancel_url: `${origin}/client/my-fleet/onboard`,
      })

      // Update pending record with Stripe session ID
      await prisma.pendingOnboarding.update({
        where: { id: pending.id },
        data: { stripeSessionId: checkoutSession.id },
      })

      return NextResponse.json({ checkoutUrl: checkoutSession.url })
    }

    // --- Direct create path (FREE or BASIC with skipped payment) ---
    const result = await prisma.$transaction(async (tx) => {
      const toNullableInt = (val: any) => (val === '' || val === undefined || val === null) ? null : Number(val)

      const pvCount = toNullableInt(purchasedVehicles)

      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          mainContact: organizationMainContact || null,
          ico: ico || null,
          dic: dic || null,
          street: street || null,
          city: city || null,
          postalCode: postalCode || null,
          country: country || null,
          tierId: tierId,
          parentOrganizationId: currentUser?.organizationId || null,
          onboardedBy: session.user.email,
          notificationPeriodStart: isPaidTier ? new Date() : null,
          purchasedVehicles: pvCount,
          vehiclesLimit: toNullableInt(vehiclesLimitOverride) ?? pvCount ?? tier?.vehiclesLimit ?? null,
          usersLimit: toNullableInt(usersLimitOverride) ?? tier?.usersLimit ?? null,
          notificationsLimit: toNullableInt(notificationsLimitOverride) ?? tier?.notificationsLimit ?? null,
          templatesLimit: toNullableInt(templatesLimitOverride) ?? tier?.templatesLimit ?? null,
          notificationTypesLimit: toNullableInt(notificationTypesLimitOverride) ?? tier?.notificationTypesLimit ?? null,
          billingInterval: billingInterval || null,
        },
        include: {
          tierRelation: {
            select: {
              id: true,
              name: true,
              usersLimit: true,
              vehiclesLimit: true,
              notificationsLimit: true,
              templatesLimit: true,
              notificationTypesLimit: true,
            }
          }
        }
      })

      // Create new user in the new organization
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phoneNumber: phoneNumber || null,
          role: 'CLIENT',
          active: true,
          organizationId: organization.id,
          isFleetManager: isFleetManager || false,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          isFleetManager: true,
          organizationId: true,
        }
      })

      return { organization, user }
    })

    return NextResponse.json({
      success: true,
      organization: result.organization,
      user: result.user,
      message: 'Organization and user created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to onboard client:', error)
    return NextResponse.json({
      error: 'Failed to onboard client',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
