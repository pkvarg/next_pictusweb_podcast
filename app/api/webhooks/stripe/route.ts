import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { generateAndSendInvoice } from '@/lib/generateInvoice'

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

  console.log(`[Stripe Webhook] Event received: ${event.type} | ID: ${event.id}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Stripe Webhook] checkout.session.completed | session: ${session.id} | metadata:`, JSON.stringify(session.metadata))

        // Handle upgrade from FREE -> paid
        const upgradeOrgId = session.metadata?.upgradeOrganizationId
        if (upgradeOrgId) {
          const targetTierId = session.metadata?.targetTierId
          const purchasedVehicles = parseInt(session.metadata?.purchasedVehicles || '1')
          const billingInterval = session.metadata?.billingInterval || 'monthly'

          const targetTier = targetTierId
            ? await prisma.tier.findUnique({ where: { id: targetTierId } })
            : null

          if (targetTier) {
            await prisma.organization.update({
              where: { id: upgradeOrgId },
              data: {
                tierId: targetTier.id,
                purchasedVehicles,
                vehiclesLimit: purchasedVehicles,
                usersLimit: targetTier.usersLimit,
                notificationsLimit: targetTier.notificationsLimit,
                templatesLimit: targetTier.templatesLimit,
                notificationTypesLimit: targetTier.notificationTypesLimit,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                stripeSubscriptionStatus: 'active',
                billingInterval,
                subscriptionStartDate: new Date(),
                notificationPeriodStart: new Date(),
                currentNotificationsCount: 0,
                notificationsBlocked: false,
                deletedAt: null,
              },
            })
            console.log('Successfully upgraded org:', upgradeOrgId, 'to tier:', targetTier.name)

            // Send upgrade confirmation email and generate invoice
            const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL
            const appUrl = process.env.NEXTAUTH_URL || 'https://www.pictusweb.sk'
            const locale = session.metadata?.locale || 'sk'
            const upgradeOrg = await prisma.organization.findUnique({ where: { id: upgradeOrgId } })
            const upgradeUser = await prisma.user.findFirst({
              where: { organizationId: upgradeOrgId },
              select: { email: true, firstName: true, lastName: true },
            })
            if (upgradeUser?.email) {
              // Generate invoice first, then send upgrade email after a delay to avoid SMTP timeout
              const upgradePricePerVehicle = billingInterval === 'yearly'
                ? Number(targetTier.pricePerVehicleYearly || 0)
                : Number(targetTier.pricePerVehicle || 0)
              generateAndSendInvoice({
                organizationName: upgradeOrg?.name || '',
                street: upgradeOrg?.street || '',
                city: upgradeOrg?.city || '',
                postalCode: upgradeOrg?.postalCode || '',
                country: upgradeOrg?.country || '',
                ico: upgradeOrg?.ico || undefined,
                dic: upgradeOrg?.dic || undefined,
                firstName: upgradeUser.firstName || '',
                lastName: upgradeUser.lastName || '',
                email: upgradeUser.email,
                tier: targetTier.name,
                billing: billingInterval,
                numberOfVehicles: purchasedVehicles,
                pricePerVehicle: upgradePricePerVehicle,
                totalPrice: upgradePricePerVehicle * purchasedVehicles,
                locale,
              }).catch((err) => console.error('Upgrade invoice generation failed:', err))

              // Send upgrade email after 5s delay to avoid SMTP connection contention
              setTimeout(() => {
                fetch(`${honoApi}/api/pictusweb/client/send-upgrade-email`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: upgradeUser.email,
                    firstName: upgradeUser.firstName || '',
                    tierName: targetTier.name,
                    billingInterval,
                    vehicleCount: purchasedVehicles,
                    loginUrl: `${appUrl}/${locale}/client`,
                    locale,
                  }),
                }).catch((err) => console.error('Upgrade email failed:', err))
              }, 5000)
            }
          }
          break
        }

        // Handle activation after free trial expiry
        const activateOrgId = session.metadata?.activateOrganizationId
        if (activateOrgId) {
          const billingInterval = session.metadata?.billingInterval || 'monthly'
          const activateVehicles = parseInt(session.metadata?.purchasedVehicles || '0') || undefined

          await prisma.organization.update({
            where: { id: activateOrgId },
            data: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              stripeSubscriptionStatus: 'active',
              billingInterval,
              subscriptionStartDate: new Date(),
              notificationPeriodStart: new Date(),
              currentNotificationsCount: 0,
              notificationsBlocked: false,
              deletedAt: null,
              freeTrialEndDate: null,
              freeTrialTierId: null,
              ...(activateVehicles && { purchasedVehicles: activateVehicles, vehiclesLimit: activateVehicles }),
            },
          })
          console.log('Successfully activated subscription for org:', activateOrgId)

          // Send activation confirmation email (fire-and-forget)
          const activateHonoApi = process.env.NEXT_PUBLIC_HONO_API_URL
          const activateAppUrl = process.env.NEXTAUTH_URL || 'https://www.pictusweb.sk'
          const activateLocale = session.metadata?.locale || 'sk'
          const activateOrg = await prisma.organization.findUnique({
            where: { id: activateOrgId },
            include: { tierRelation: true },
          })
          const activateUser = await prisma.user.findFirst({
            where: { organizationId: activateOrgId },
            select: { email: true, firstName: true, lastName: true },
          })
          if (activateUser?.email) {
            const activateVehicleCount = activateVehicles || activateOrg?.purchasedVehicles || 1

            // Send activation email (fire-and-forget)
            fetch(`${activateHonoApi}/api/pictusweb/client/send-activation-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: activateUser.email,
                firstName: activateUser.firstName || '',
                tierName: activateOrg?.tierRelation?.name || 'BUSINESS',
                billingInterval,
                vehicleCount: activateVehicleCount,
                loginUrl: `${activateAppUrl}/${activateLocale}/client`,
                locale: activateLocale,
              }),
            }).catch((err) => console.error('Activation email failed:', err))

            // Generate invoice (fire-and-forget)
            const activateTier = activateOrg?.tierRelation
            const activatePricePerVehicle = billingInterval === 'yearly'
              ? Number(activateTier?.pricePerVehicleYearly || 0)
              : Number(activateTier?.pricePerVehicle || 0)
            generateAndSendInvoice({
              organizationName: activateOrg?.name || '',
              street: activateOrg?.street || '',
              city: activateOrg?.city || '',
              postalCode: activateOrg?.postalCode || '',
              country: activateOrg?.country || '',
              ico: activateOrg?.ico || undefined,
              dic: activateOrg?.dic || undefined,
              firstName: activateUser.firstName || '',
              lastName: activateUser.lastName || '',
              email: activateUser.email,
              tier: activateTier?.name || 'BUSINESS',
              billing: billingInterval,
              numberOfVehicles: activateVehicleCount,
              pricePerVehicle: activatePricePerVehicle,
              totalPrice: activatePricePerVehicle * activateVehicleCount,
              locale: activateLocale,
            }).catch((err) => console.error('Activation invoice generation failed:', err))
          }

          break
        }

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

        // Send welcome email (fire-and-forget)
        const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL
        const appUrl = process.env.NEXTAUTH_URL || 'https://www.pictusweb.sk'
        const locale = session.metadata?.locale || 'sk'
        const isSelfSignup = onboardedBy === pending.email

        if (isSelfSignup) {
          // Self-signup: send welcome email with their tier
          fetch(`${honoApi}/api/pictusweb/client/send-free-welcome-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: pending.email,
              firstName: pending.firstName,
              loginUrl: `${appUrl}/${locale}/client`,
              tierName: tier.name,
              locale,
            }),
          }).catch((err) => console.error('Welcome email (webhook) failed:', err))
        } else {
          // Agent-onboarded: use the agent welcome email
          fetch(`${honoApi}/api/pictusweb/client/send-welcome-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: pending.email,
              firstName: pending.firstName,
              agentName: onboardedBy,
              agentEmail: onboardedBy,
              loginUrl: `${appUrl}/${locale}/auth/login`,
              gdprUrl: `${appUrl}/gdpr`,
              termsUrl: `${appUrl}/obchodne-podmienky`,
              locale,
            }),
          }).catch((err) => console.error('Welcome email (webhook) failed:', err))
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status
        console.log(`[Stripe Webhook] customer.subscription.updated | sub: ${subscription.id} | status: ${status}`)

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
        console.log(`[Stripe Webhook] customer.subscription.deleted | sub: ${subscription.id}`)

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

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Stripe Webhook] invoice.paid | invoice: ${invoice.id} | billing_reason: ${invoice.billing_reason} | customer: ${typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id} | amount: ${invoice.amount_paid}`)

        // Skip the first invoice from checkout — those are handled in checkout.session.completed
        if (invoice.billing_reason === 'subscription_create') {
          console.log('Skipping invoice.paid for subscription_create (handled in checkout):', invoice.id)
          break
        }

        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (!customerId) break

        const invoiceOrg = await prisma.organization.findFirst({
          where: { stripeCustomerId: customerId },
          include: { tierRelation: true },
        })

        if (!invoiceOrg) {
          console.error('No org found for Stripe customer:', customerId)
          break
        }

        const invoiceUser = await prisma.user.findFirst({
          where: { organizationId: invoiceOrg.id },
          select: { email: true, firstName: true, lastName: true },
        })

        if (invoiceUser?.email && invoiceOrg.tierRelation) {
          const invBillingInterval = invoiceOrg.billingInterval || 'monthly'
          const invPricePerVehicle = invBillingInterval === 'yearly'
            ? Number(invoiceOrg.tierRelation.pricePerVehicleYearly || 0)
            : Number(invoiceOrg.tierRelation.pricePerVehicle || 0)
          const invVehicleCount = invoiceOrg.purchasedVehicles || 1

          generateAndSendInvoice({
            organizationName: invoiceOrg.name,
            street: invoiceOrg.street || '',
            city: invoiceOrg.city || '',
            postalCode: invoiceOrg.postalCode || '',
            country: invoiceOrg.country || '',
            ico: invoiceOrg.ico || undefined,
            dic: invoiceOrg.dic || undefined,
            firstName: invoiceUser.firstName || '',
            lastName: invoiceUser.lastName || '',
            email: invoiceUser.email,
            tier: invoiceOrg.tierRelation.name,
            billing: invBillingInterval,
            numberOfVehicles: invVehicleCount,
            pricePerVehicle: invPricePerVehicle,
            totalPrice: invPricePerVehicle * invVehicleCount,
          }).catch((err) => console.error('Recurring invoice generation failed:', err))

          // Reset notification counter on renewal
          await prisma.organization.update({
            where: { id: invoiceOrg.id },
            data: {
              notificationPeriodStart: new Date(),
              currentNotificationsCount: 0,
              notificationsBlocked: false,
            },
          })

          console.log('Recurring invoice generated for org:', invoiceOrg.name, '| invoice:', invoice.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error(`[Stripe Webhook] invoice.payment_failed | invoice: ${invoice.id} | customer: ${invoice.customer}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
