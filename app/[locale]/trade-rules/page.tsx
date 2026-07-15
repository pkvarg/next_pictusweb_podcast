import React from 'react'
import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'
import TradeRulesContent from '@/app/components/contact/TradeRulesContent'
import { setRequestLocale } from 'next-intl/server'

const TradeRulesPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="pl" data-locale={locale}>
      <PictusPagesHeader />
      <main id="main" className="section-shell legal-shell">
        <div className="layout-container">
          <TradeRulesContent />
        </div>
      </main>
      <PictusFooter homeBase={`/${locale}`} />
    </div>
  )
}

export default TradeRulesPage
