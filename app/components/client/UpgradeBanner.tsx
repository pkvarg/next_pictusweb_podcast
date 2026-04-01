'use client'

import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface UpgradeBannerProps {
  billingInterval: string
  nextBillingDate?: string
}

export default function UpgradeBanner({ billingInterval, nextBillingDate }: UpgradeBannerProps) {
  const t = useTranslations('Client')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
        <p className="text-sm">
          {billingInterval === 'yearly'
            ? t('upgradeBannerYearly')
            : nextBillingDate
              ? t('upgradeBannerMonthly', { nextBillingDate })
              : t('upgradeBannerMonthlyGeneric')
          }
        </p>
      </div>
    </div>
  )
}
