'use client'
import { motion } from 'framer-motion'
import { footerVariants } from '@/lib/motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { updateVisitors } from '@/lib/visitorsCounter'
import CookieConsent from 'react-cookie-consent'
import Image from 'next/image'

const fontSystem = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const Footer = () => {
  const t = useTranslations('Home')

  const increaseVisitors = async () => {
    await updateVisitors()
  }

  return (
    <footer className="relative pt-16 md:pt-24 pb-8 px-6 md:px-12" style={fontSystem}>
      <CookieConsent
        location="bottom"
        style={{
          background: 'rgba(24, 24, 27, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#e4e4e7',
          fontSize: '15px',
          textAlign: 'start',
          borderTop: '1px solid rgba(182, 224, 54, 0.15)',
          padding: '14px 24px',
          alignItems: 'center',
        }}
        buttonStyle={{
          background: 'linear-gradient(to right, #B6E036, #8ab52a)',
          color: '#18181b',
          fontSize: '14px',
          fontWeight: 500,
          padding: '8px 32px',
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
          padding: '8px 24px',
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

      <motion.div
        variants={footerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Top border */}
        <div className="h-px w-full bg-white/[0.06] mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-16">
          {/* Logo & description */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-[#F8F8F8] text-lg tracking-tight font-normal mb-6"
            >
              <Image src="/logo-pictusweb.svg" alt="Pictusweb" width={36} height={36} />
              PICTUSWEB
            </Link>
            <p className="text-[#F8F8F8]/40 text-[14px] font-light mb-4">{t('companyDescription1')}</p>
            <Link
              href="/client"
              className="text-pictus-lime text-[14px] font-medium hover:text-pictus-lime/80 transition-colors duration-200"
            >
              {t('footerForClients')}
            </Link>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-[#F8F8F8]/80 text-xs font-medium tracking-widest uppercase mb-5">
              {t('footerCategory2')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/podcasts"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('navbarPodcasts')}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('navbarProjects')}
                </Link>
              </li>
              <li>
                <Link
                  href="/fleetsync"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('footerService6')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('navbarContact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#F8F8F8]/80 text-xs font-medium tracking-widest uppercase mb-5">
              {t('footerCategory3')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:info@pictusweb.sk"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  info@pictusweb.sk
                </a>
              </li>
              <li className="text-[#F8F8F8]/50 text-[14px] font-light">
                +421 948 024 638
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px w-full bg-white/[0.06] mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#F8F8F8]/40 text-[13px] font-light">
            &copy; Pictusweb {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-2 text-[#F8F8F8]/30 text-[12px] font-light">
            <Link href="/gdpr" className="hover:text-pictus-lime transition-colors duration-200">
              GDPR
            </Link>
            <span>|</span>
            <Link href="/trade-rules" className="hover:text-pictus-lime transition-colors duration-200">
              {t('footerTradeRules')}
            </Link>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}

export default Footer
