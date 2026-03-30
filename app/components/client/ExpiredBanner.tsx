'use client'

import { AlertTriangle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ExpiredBannerProps {
  tierName: string
  endDate: string
}

export default function ExpiredBanner({ tierName, endDate }: ExpiredBannerProps) {
  const t = useTranslations('Client')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  const formattedDate = new Date(endDate).toLocaleDateString(locale === 'sk' ? 'sk-SK' : locale === 'hu' ? 'hu-HU' : 'en-GB')

  return (
    <div className="w-full bg-red-500/15 border border-red-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-300 font-medium">
            {t('expiredTitle', { tierName, endDate: formattedDate })}
          </p>
          <p className="text-red-300/70 text-sm mt-1">
            {t('expiredDescription')}
          </p>
        </div>
        <Link
          href="/client/activate"
          className="shrink-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-sm font-medium"
        >
          {t('expiredSubscribe')}
        </Link>
      </div>
    </div>
  )
}
