'use client'

import { CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export default function ActivateSuccessPage() {
  const t = useTranslations('Client')

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="p-5 bg-pictus-lime/15 ring-1 ring-pictus-lime/30 rounded-3xl inline-block">
          <CheckCircle className="w-12 h-12 text-pictus-lime" />
        </div>
      </div>

      <h1 className="text-3xl font-light text-white mb-4">{t('activateSuccessTitle')}</h1>
      <p className="text-gray-400 text-lg font-light mb-8">{t('activateSuccessDescription')}</p>

      <Link
        href="/client"
        className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-semibold hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all"
      >
        {t('goToDashboard')}
      </Link>
    </div>
  )
}
