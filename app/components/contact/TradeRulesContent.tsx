'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

const TradeRulesContent = () => {
  const t = useTranslations('Home')

  const fleetSyncSections = Array.from({ length: 15 }, (_, i) => i + 1)
  const generalSections = Array.from({ length: 11 }, (_, i) => i + 1)

  return (
    <article className="prose">
      <h2>{t('tradeRulesFleetSyncTitle')}</h2>
      <p className="prose-sub">{t('tradeRulesFleetSyncSubtitle')}</p>

      {fleetSyncSections.map((n) => (
        <React.Fragment key={`fs-${n}`}>
          <h3>{t(`tradeRulesFleetSyncSection${n}Title`)}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t(`tradeRulesFleetSyncSection${n}Text`)}</p>
        </React.Fragment>
      ))}

      <h3>{t('tradeRulesFleetSyncContactTitle')}</h3>
      <p style={{ whiteSpace: 'pre-line' }}>{t('tradeRulesFleetSyncContactText')}</p>

      <div className="prose-divider">
        {generalSections.map((n) => (
          <React.Fragment key={`tr-${n}`}>
            <h3>{t(`tradeRulesSection${n}Title`)}</h3>
            <p>{t(`tradeRulesSection${n}Text`)}</p>
          </React.Fragment>
        ))}
      </div>
    </article>
  )
}

export default TradeRulesContent
