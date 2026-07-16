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
    <footer className="bg-pictus-onyx950 pb-10 pt-20" style={satoshi}>
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

      <div className="mx-auto w-[min(100%-2rem,1296px)]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand + contact */}
          <div className="grid max-w-[340px] content-start gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-[1.2rem] font-bold text-pictus-white"
              aria-label="Pictus home"
            >
              <Image src="/pictus/PictusMOSS.svg" width={30} height={30} alt="" />
              Pictusweb
            </Link>
            <div className="grid gap-2.5 text-[0.95rem] leading-tight text-pictus-white/70">
              <span className="mb-1 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-pictus-lime">
                {t('footerCategory3')}
              </span>
              <a href="tel:+421948024638" className="hover:text-pictus-white">
                +421 948 024 638
              </a>
              <a href="mailto:info@pictusweb.sk" className="hover:text-pictus-white">
                info@pictusweb.sk
              </a>
            </div>
            <Link
              href="/client"
              className="inline-flex w-fit items-center gap-1.5 font-bold text-pictus-lime transition-colors hover:text-pictus-lime300"
            >
              {t('footerForClients')} <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Pages */}
          <nav className="grid content-start gap-3.5 text-[0.98rem]">
            <span className="mb-1 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-pictus-lime">
              {t('footerCategory2')}
            </span>
            <Link href="/fleetsync" className="text-pictus-white/70 hover:text-pictus-white">
              {t('footerService6')}
            </Link>
            <Link href="/projects" className="text-pictus-white/70 hover:text-pictus-white">
              {t('navbarProjects')}
            </Link>
            <Link href="/podcasts" className="text-pictus-white/70 hover:text-pictus-white">
              {t('navbarPodcasts')}
            </Link>
            <Link href="/contact" className="text-pictus-white/70 hover:text-pictus-white">
              {t('navbarContact')}
            </Link>
          </nav>

          {/* Company blurb */}
          <div className="grid content-start gap-3.5 text-[0.98rem]">
            <span className="mb-1 text-[0.74rem] font-bold uppercase tracking-[0.14em] text-pictus-lime">
              Pictusweb
            </span>
            <p className="max-w-[280px] leading-relaxed text-pictus-white/70">
              {t('companyDescription1')}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="text-[0.9rem] text-pictus-white/50">
            &copy; {new Date().getFullYear()} Pictusweb
          </p>
          <div className="flex gap-6 text-[0.9rem] text-pictus-white/50">
            <Link href="/gdpr" className="hover:text-pictus-lime">
              GDPR
            </Link>
            <Link href="/trade-rules" className="hover:text-pictus-lime">
              {t('footerTradeRules')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
