'use client'

import { AlertTriangle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ExpiredBannerProps {
  tierName: string
  endDate: string
  manuallyPaid?: boolean
}

export default function ExpiredBanner({ tierName, endDate, manuallyPaid }: ExpiredBannerProps) {
  const t = useTranslations('Client')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  const formattedDate = new Date(endDate).toLocaleDateString(
    locale === 'sk' ? 'sk-SK' : locale === 'hu' ? 'hu-HU' : 'en-GB',
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-medium">
            {manuallyPaid
              ? t('expiredPaidTitle', { tierName, endDate: formattedDate })
              : t('expiredTitle', { tierName, endDate: formattedDate })}
          </p>
          <p className="text-red-300/70 mt-1">
            {manuallyPaid ? t('expiredPaidDescription') : t('expiredDescription')}
          </p>
        </div>
        {manuallyPaid ? (
          <a
            href="mailto:info@pictusweb.sk?subject=Obnovenie%20predplatn%C3%A9ho%20FleetSync"
            className="shrink-0 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all text-sm font-semibold"
          >
            {t('expiredContactUs')}
          </a>
        ) : (
          <Link
            href="/client/activate"
            className="shrink-0 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all text-sm font-semibold"
          >
            {t('expiredSubscribe')}
          </Link>
        )}
      </div>
    </div>
  )
}
