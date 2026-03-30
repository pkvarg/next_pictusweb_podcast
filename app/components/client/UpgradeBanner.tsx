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
    <div className="w-full bg-purple-500/15 border border-purple-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
        <p className="text-purple-300">
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
