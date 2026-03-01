import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export async function getStripePriceId(tierName: string, billingInterval: string): Promise<string> {
  const tier = await prisma.tier.findUnique({
    where: { name: tierName.toUpperCase() },
    select: { stripePriceMonthly: true, stripePriceYearly: true },
  })

  if (!tier) {
    throw new Error(`Tier not found: ${tierName}`)
  }

  const priceId = billingInterval === 'yearly' ? tier.stripePriceYearly : tier.stripePriceMonthly

  if (!priceId) {
    throw new Error(`No Stripe price configured for tier: ${tierName}, interval: ${billingInterval}`)
  }

  return priceId
}
