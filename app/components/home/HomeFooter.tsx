'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { footerVariants } from '@/lib/motion'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import CookieConsent from 'react-cookie-consent'
import { updateVisitors } from '@/lib/visitorsCounter'

const HomeFooter = () => {
  const t = useTranslations('Home')

  const increaseVisitors = async () => {
    await updateVisitors()
  }

  return (
    <footer
      className="relative pt-16 md:pt-24 pb-8 px-6 md:px-12"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
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
        <div className="h-px w-full bg-white/10 mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-16">
          {/* Logo & description */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-[#F8F8F8] text-2xl tracking-tight font-normal inline-block mb-4"
            >
              Logo
            </Link>
            <p className="text-[#F8F8F8]/40 text-sm font-light leading-relaxed">
              {t('companyDescription1')}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#F8F8F8] text-sm font-semibold tracking-widest uppercase mb-5">
              {t('footerCategory1')}
            </h4>
            <ul className="space-y-3">
              {[
                'footerService1',
                'footerService2',
                'footerService3',
                'footerService4',
                'footerService5',
                'footerService6',
              ].map((key) => (
                <li key={key}>
                  <Link
                    href="/#projects"
                    className="text-[#F8F8F8]/50 text-sm font-light hover:text-pictus-lime transition-colors duration-200"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#F8F8F8] text-sm font-semibold tracking-widest uppercase mb-5">
              {t('footerCategory2')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact#about"
                  className="text-[#F8F8F8]/50 text-sm font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('navbarAbout')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact#gdpr"
                  className="text-[#F8F8F8]/50 text-sm font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  GDPR
                </Link>
              </li>
              <li>
                <Link
                  href="/contact#trade-rules"
                  className="text-[#F8F8F8]/50 text-sm font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('footerTradeRules')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#F8F8F8] text-sm font-semibold tracking-widest uppercase mb-5">
              {t('footerCategory3')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@pictusweb.sk"
                  className="text-[#F8F8F8]/50 text-sm font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  info@pictusweb.sk
                </a>
              </li>
              <li className="text-[#F8F8F8]/50 text-sm font-light">
                +421 948 024 638
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/client"
                className="text-pictus-lime text-sm font-medium hover:text-pictus-lime/80 transition-colors duration-200"
              >
                {t('footerForClients')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px w-full bg-white/10 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#F8F8F8]/30 text-xs font-light">
            Copyright &copy; {new Date().getFullYear()} Pictusweb s.r.o.
          </p>
          <p className="text-[#F8F8F8]/30 text-xs font-light">
            {t('companyDescription2')}
          </p>
        </div>
      </motion.div>
    </footer>
  )
}

export default HomeFooter
