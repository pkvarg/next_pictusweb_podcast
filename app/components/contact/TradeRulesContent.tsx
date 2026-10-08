'use client'
import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

type Terms = 'general' | 'fleetsync'

const FLEETSYNC_HASH = '#fleetsync'

const TradeRulesContent = () => {
  const t = useTranslations('Legal')
  const [active, setActive] = useState<Terms>('general')

  // FleetSync sign-up links to /trade-rules#fleetsync
  useEffect(() => {
    const syncWithHash = () => {
      setActive(window.location.hash === FLEETSYNC_HASH ? 'fleetsync' : 'general')
    }
    syncWithHash()
    window.addEventListener('hashchange', syncWithHash)
    return () => window.removeEventListener('hashchange', syncWithHash)
  }, [])

  const select = (terms: Terms) => {
    setActive(terms)
    const url = `${window.location.pathname}${window.location.search}${
      terms === 'fleetsync' ? FLEETSYNC_HASH : ''
    }`
    window.history.replaceState(null, '', url)
  }

  const prefix = active === 'fleetsync' ? 'termsFleetSync' : 'termsGeneral'
  const sectionCount = active === 'fleetsync' ? 15 : 12
  const sections = Array.from({ length: sectionCount }, (_, i) => i + 1)

  return (
    <article className="prose">
      <div className="legal-tabs" role="tablist" aria-label={t('termsTabsAria')}>
        <button
          type="button"
          role="tab"
          className="legal-tab"
          aria-selected={active === 'general'}
          aria-controls="terms-panel"
          onClick={() => select('general')}
        >
          {t('termsGeneralTab')}
        </button>
        <button
          type="button"
          role="tab"
          className="legal-tab"
          aria-selected={active === 'fleetsync'}
          aria-controls="terms-panel"
          onClick={() => select('fleetsync')}
        >
          {t('termsFleetSyncTab')}
        </button>
      </div>

      <div id="terms-panel" role="tabpanel">
        <h2>{t(`${prefix}Title`)}</h2>
        <p className="prose-sub">{t(`${prefix}Subtitle`)}</p>

        {sections.map((n) => (
          <React.Fragment key={`${prefix}-${n}`}>
            <h3>{t(`${prefix}Section${n}Title`)}</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{t(`${prefix}Section${n}Text`)}</p>
          </React.Fragment>
        ))}

        <h3>{t('termsContactTitle')}</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{t('termsContactText')}</p>
      </div>
    </article>
  )
}

export default TradeRulesContent
