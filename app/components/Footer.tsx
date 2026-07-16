'use client'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { updateVisitors } from '@/lib/visitorsCounter'
import CookieConsent from 'react-cookie-consent'
import Image from 'next/image'

const satoshi = { fontFamily: 'Satoshi, system-ui, sans-serif' }

const Footer = () => {
  const t = useTranslations('Home')

  const increaseVisitors = async () => {
    await updateVisitors()
  }

  return (
    <footer className="bg-pictus-onyx900 pb-[76px] pt-20" style={satoshi}>
      <CookieConsent
        location="bottom"
        style={{
          background: 'rgba(14, 15, 16, 0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#e4e4e7',
          fontSize: '15px',
          textAlign: 'start',
          borderTop: '1px solid rgba(148, 184, 74, 0.15)',
          padding: '14px 24px',
          alignItems: 'center',
        }}
        buttonStyle={{
          background: '#94b84a',
          color: '#0e0f10',
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

      <div className="mx-auto grid w-[min(100%-2rem,1296px)] grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-[minmax(0,1fr)_184px_260px]">
        {/* Brand column */}
        <div className="grid content-start gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold text-pictus-white"
            aria-label="Pictus home"
          >
            <Image src="/pictus/PictusMOSS.svg" width={26} height={26} alt="" />
            Pictusweb
          </Link>
          <div className="grid gap-2 text-[0.95rem] leading-tight text-pictus-white/75">
            <strong className="font-bold text-pictus-lime">Kontakt</strong>
            <a href="tel:+421948024638" className="hover:text-pictus-white">
              +421 948 024 638
            </a>
            <a href="mailto:info@pictusweb.sk" className="hover:text-pictus-white">
              info@pictusweb.sk
            </a>
          </div>
          <Link
            href="/client"
            className="font-bold text-pictus-lime transition-colors hover:text-pictus-lime300"
          >
            {t('footerForClients')}
          </Link>
        </div>

        {/* Pages */}
        <nav className="grid content-start gap-[18px] text-[0.95rem] text-pictus-white/75">
          <Link href="/fleetsync" className="hover:text-pictus-white">
            {t('footerService6')}
          </Link>
          <Link href="/projects" className="hover:text-pictus-white">
            {t('navbarProjects')}
          </Link>
          <Link href="/podcasts" className="hover:text-pictus-white">
            {t('navbarPodcasts')}
          </Link>
          <Link href="/contact" className="hover:text-pictus-white">
            {t('navbarContact')}
          </Link>
        </nav>

        {/* Legal / meta */}
        <div className="grid content-start gap-[18px] text-[0.95rem] text-pictus-white/75">
          <Link href="/gdpr" className="hover:text-pictus-white">
            GDPR
          </Link>
          <Link href="/trade-rules" className="hover:text-pictus-white">
            {t('footerTradeRules')}
          </Link>
          <p className="mt-2 text-pictus-white/50">&copy; {new Date().getFullYear()} Pictusweb</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
