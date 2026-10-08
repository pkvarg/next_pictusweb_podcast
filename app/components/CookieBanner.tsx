'use client'
import { useEffect, useState } from 'react'
import CookieConsent from 'react-cookie-consent'
import { useLocale, useTranslations } from 'next-intl'
import { updateVisitors } from '@/lib/visitorsCounter'
import { OPEN_COOKIE_SETTINGS_EVENT, storeConsent } from '@/lib/cookieConsent'

type Visibility = 'byCookieValue' | 'show' | 'hidden'

const CookieBanner = () => {
  const t = useTranslations('Home')
  const locale = useLocale()
  const [visible, setVisible] = useState<Visibility>('byCookieValue')

  // Footer "Cookie settings" link reopens the banner so consent can be
  // withdrawn as easily as it was given.
  useEffect(() => {
    const open = () => setVisible('show')
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open)
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open)
  }, [])

  const decide = (granted: boolean) => {
    const firstDecision = visible === 'byCookieValue'
    storeConsent(granted)
    setVisible('hidden')
    if (firstDecision) {
      updateVisitors()
    }
  }

  return (
    <CookieConsent
      visible={visible}
      location="bottom"
      style={{
        background: 'rgba(14, 15, 16, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#e4e4e7',
        fontFamily: 'Satoshi, system-ui, sans-serif',
        fontSize: '15px',
        textAlign: 'start',
        borderTop: '1px solid rgba(148, 184, 74, 0.2)',
        padding: '14px 24px',
        alignItems: 'center',
        zIndex: 60,
      }}
      buttonStyle={{
        background: '#94b84a',
        color: '#0e0f10',
        fontFamily: 'Satoshi, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: 700,
        padding: '10px 32px',
        borderRadius: '9999px',
        border: 'none',
      }}
      buttonText={t('cookiesAgree')}
      expires={365}
      enableDeclineButton
      flipButtons
      onDecline={() => decide(false)}
      declineButtonStyle={{
        background: 'transparent',
        color: '#e4e4e7',
        fontFamily: 'Satoshi, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: 700,
        padding: '10px 32px',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 255, 255, 0.35)',
      }}
      declineButtonText={t('cookiesDisagree')}
      onAccept={() => decide(true)}
    >
      {t('cookies')}{' '}
      <a href={`/${locale}/gdpr#cookies`} style={{ color: '#94b84a', textDecoration: 'underline' }}>
        {t('cookiesMore')}
      </a>
    </CookieConsent>
  )
}

export default CookieBanner
