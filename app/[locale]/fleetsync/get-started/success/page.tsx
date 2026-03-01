'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const t = useTranslations('FleetSyncOnboarding')
  const isFree = searchParams.get('tier') === 'FREE'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      <PagesHeader />
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-pictus-lime/20 rounded-xl inline-block">
            <CheckCircle className="w-12 h-12 text-pictus-lime" />
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-light mb-4">{t('successTitle')}</h1>
        <p className="text-gray-400 text-lg font-light mb-8">
          {isFree ? t('successDescriptionFree') : t('successDescriptionPaid')}
        </p>

        <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-2xl p-6 mb-8 text-left border border-pictus-lime/30 backdrop-blur-sm">
          <h3 className="font-normal text-lg mb-4 text-pictus-white">{t('successNextSteps')}</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-sm w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-normal">1</span>
              <p className="text-gray-300 font-light">{t('successStep1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-sm w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-normal">2</span>
              <p className="text-gray-300 font-light">{t('successStep2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-sm w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-normal">3</span>
              <p className="text-gray-300 font-light">{t('successStep3')}</p>
            </div>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50"
        >
          {t('goToLogin')}
        </Link>
      </div>
      <Footer />
    </div>
  )
}
