'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface UpgradeBannerProps {
  billingInterval: string
  nextBillingDate?: string
  fromTier?: string | null
}

export default function UpgradeBanner({
  billingInterval,
  nextBillingDate,
  fromTier,
}: UpgradeBannerProps) {
  const t = useTranslations('Client')

  const isFromFree = !fromTier || fromTier === 'FREE'

  const getMessage = () => {
    if (isFromFree) {
      return t('upgradeBannerNewSubscription')
    }
    if (billingInterval === 'yearly') {
      return t('upgradeBannerYearly')
    }
    return nextBillingDate
      ? t('upgradeBannerMonthly', { nextBillingDate })
      : t('upgradeBannerMonthlyGeneric')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-pictus-lime/10 border border-pictus-lime/20 text-pictus-lime">
        <Sparkles className="w-5 h-5 text-pictus-lime shrink-0" />
        <p className="text-sm">{getMessage()}</p>
      </div>
    </div>
  )
}
