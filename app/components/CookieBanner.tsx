'use client'
import CookieConsent from 'react-cookie-consent'
import { useTranslations } from 'next-intl'
import { updateVisitors } from '@/lib/visitorsCounter'

const CookieBanner = () => {
  const t = useTranslations('Home')

  const increaseVisitors = async () => {
    await updateVisitors()
  }

  return (
    <CookieConsent
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
      buttonText="OK"
      expires={365}
      enableDeclineButton
      onDecline={() => {
        localStorage.setItem('CookieConsent', 'false')
        increaseVisitors()
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#a1a1aa',
        fontFamily: 'Satoshi, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        padding: '10px 24px',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
      declineButtonText={t('cookiesDisagree')}
      onAccept={() => {
        localStorage.setItem('CookieConsent', 'true')
        increaseVisitors()
      }}
    >
      {t('cookies')}
    </CookieConsent>
  )
}

export default CookieBanner
