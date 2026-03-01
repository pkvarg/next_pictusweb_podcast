'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import { XCircle } from 'lucide-react'

export default function CancelPage() {
  const t = useTranslations('FleetSyncOnboarding')

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      <PagesHeader />
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/20 rounded-xl inline-block">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-light mb-4">{t('cancelTitle')}</h1>
        <p className="text-gray-400 text-lg font-light mb-8">{t('cancelDescription')}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/fleetsync"
            className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50"
          >
            {t('tryAgain')}
          </Link>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-lg bg-pictus-white/10 text-pictus-white font-light hover:bg-pictus-white/20 transition-all"
          >
            {t('contactUs')}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
