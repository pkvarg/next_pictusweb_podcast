import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const pendingId = session.metadata?.pendingOnboardingId

        if (!pendingId) {
          console.error('No pendingOnboardingId in checkout session metadata')
          break
        }

        // Fetch pending record
        const pending = await prisma.pendingOnboarding.findUnique({
          where: { id: pendingId },
          include: { tier: true },
        })

        if (!pending) {
          console.error('PendingOnboarding not found:', pendingId)
          break
        }

        // Check if org already created (idempotency)
        const existingUser = await prisma.user.findUnique({
          where: { email: pending.email },
          select: { id: true },
        })

        if (existingUser) {
          console.log('User already exists, skipping org creation:', pending.email)
          // Clean up pending record
          await prisma.pendingOnboarding.delete({ where: { id: pendingId } })
          break
        }

        const tier = pending.tier

        // Read parentOrganizationId from session metadata (set by admin onboarding)
        const parentOrganizationId = session.metadata?.parentOrganizationId || null
        const onboardedBy = session.metadata?.onboardedBy || pending.email

        // Create organization + user in transaction
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
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              stripeSubscriptionStatus: 'active',
              billingInterval: pending.billingInterval,
              subscriptionStartDate: new Date(),
            },
          })

          await tx.user.create({
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
        })

        // Delete pending record
        await prisma.pendingOnboarding.delete({ where: { id: pendingId } })
        console.log('Successfully onboarded paid user:', pending.email)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status

        const org = await prisma.organization.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (org) {
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              stripeSubscriptionStatus: status,
              notificationsBlocked: status === 'past_due' || status === 'unpaid',
            },
          })
          console.log(`Subscription ${subscription.id} updated to ${status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const org = await prisma.organization.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (org) {
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              stripeSubscriptionStatus: 'canceled',
              notificationsBlocked: true,
            },
          })
          console.log(`Subscription ${subscription.id} canceled`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error('Payment failed for invoice:', invoice.id, 'customer:', invoice.customer)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
