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
        style={{ backgroundColor: '#171816' }}
      >
        {/* Top border */}
        <div className="h-px w-full bg-white/10 mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-16">
          {/* Logo & contact */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-[#F8F8F8] text-2xl tracking-tight font-normal inline-block mb-6"
            >
              Logo
            </Link>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@pictusweb.sk"
                  className="text-[#F8F8F8]/50 text-[16px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  info@pictusweb.sk
                </a>
              </li>
              <li className="text-[#F8F8F8]/50 text-[16px] font-light">
                +421 948 024 638
              </li>
              <li className="pt-3">
                <Link
                  href="/client"
                  className="text-pictus-lime text-[16px] font-medium hover:text-pictus-lime/80 transition-colors duration-200"
                >
                  {t('footerForClients')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  Domov
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  Služby
                </Link>
              </li>
              <li>
                <Link
                  href="/contact#about"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  O nás
                </Link>
              </li>
              <li>
                <Link
                  href="/#projects"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  Projekty
                </Link>
              </li>
              <li>
                <Link
                  href="/#process"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  Proces
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  Weby
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  Redizajn webov
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  AI riešenia
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  AI média
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8] text-[16px] font-normal hover:text-pictus-lime transition-colors duration-200"
                >
                  FleetSync
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px w-full bg-white/10 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#F8F8F8] text-[14px] font-normal">
            &copy;PictusWorld {new Date().getFullYear()}
          </p>
          <p className="text-[#F8F8F8] text-[13px] font-normal">
            Privacy Policy &nbsp;|&nbsp; Terms &amp; Conditions
          </p>
        </div>
      </motion.div>
    </footer>
  )
}

export default HomeFooter
