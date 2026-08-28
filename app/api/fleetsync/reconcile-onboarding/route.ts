import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { completePaidOnboarding } from '@/lib/completeOnboarding'
import { prodLogger } from '@/lib/prodLogger'

/**
 * Fallback account creation invoked by the checkout success page. If the Stripe
 * webhook is delayed or failed, this ensures a paid customer still gets an
 * account instead of silently being unable to log in. Idempotent.
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ status: 'not_paid' }, { status: 200 })
    }

    // Only self-signup checkouts carry a pendingOnboardingId. Upgrade/activate
    // flows operate on an existing org and are handled solely by the webhook.
    const pendingId = session.metadata?.pendingOnboardingId
    if (!pendingId) {
      return NextResponse.json({ status: 'no_pending' }, { status: 200 })
    }

    const result = await completePaidOnboarding({
      pendingId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      parentOrganizationId: session.metadata?.parentOrganizationId || null,
      onboardedBy: session.metadata?.onboardedBy || null,
      locale: session.metadata?.locale || 'sk',
      source: 'success_page',
    })

    if (result.status === 'created') {
      prodLogger.warn('[ONBOARDING] account recovered via success-page fallback', {
        sessionId,
        email: result.email,
      })
    }

    return NextResponse.json(result, { status: result.status === 'error' ? 500 : 200 })
  } catch (error) {
    prodLogger.error('[ONBOARDING_ALERT] reconcile-onboarding failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: 'Reconcile failed' }, { status: 500 })
  }
}
