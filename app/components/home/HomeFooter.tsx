'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { footerVariants } from '@/lib/motion'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import CookieConsent from 'react-cookie-consent'
import { updateVisitors } from '@/lib/visitorsCounter'
import Image from 'next/image'
import { Figma } from 'lucide-react'

const ReactIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <ellipse cx="12" cy="12" rx="10" ry="4" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
)

const NextjsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 0-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.251 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.86-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.572 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z" />
  </svg>
)

const N8nIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623A2.52 2.52 0 0 0 13.9607 12a2.52 2.52 0 0 0 .821-1.4794l.1038-.623a1.263 1.263 0 0 1 1.2459-1.0555h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263m0 1.2632a1.263 1.263 0 0 1 1.2631 1.2631 1.263 1.263 0 0 1-1.2631 1.2632 1.263 1.263 0 0 1-1.2632-1.2632 1.263 1.263 0 0 1 1.2632-1.2631M2.5263 10.7368A1.263 1.263 0 0 1 3.7895 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 1.2632 12a1.263 1.263 0 0 1 1.2631-1.2632m6.3158 0A1.263 1.263 0 0 1 10.1053 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 7.579 12a1.263 1.263 0 0 1 1.2632-1.2632m10.1053 3.7895a1.263 1.263 0 0 1 1.2631 1.2632 1.263 1.263 0 0 1-1.2631 1.2631 1.263 1.263 0 0 1-1.2632-1.2631 1.263 1.263 0 0 1 1.2632-1.2632" />
  </svg>
)

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
        <div className="h-px w-full bg-white/[0.06] mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-16">
          {/* Logo & contact */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#F8F8F8] text-lg tracking-tight font-normal mb-6"
            >
              <Image src="/PictusLIME.webp" alt="Pictusweb" width={36} height={36} />
              PICTUSWEB
            </Link>
            <ul className="space-y-3">
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
              <li className="pt-3">
                <Link
                  href="/client"
                  className="text-pictus-lime text-[14px] font-medium hover:text-pictus-lime/80 transition-colors duration-200"
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
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('navbarHome')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('navbarOffer')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact#about"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('navbarAbout')}
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
                  href="/#process"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('homeFooterProcess')}
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
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('homeFooterWebs')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('homeFooterRedesign')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('homeFooterAI')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  {t('homeFooterAIMedia')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#F8F8F8]/50 text-[14px] font-light hover:text-pictus-lime transition-colors duration-200"
                >
                  FleetSync
                </Link>
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

          {/* Core Tools */}
          <div className="flex items-center gap-5">
            <span className="text-[#F8F8F8]/30 text-[11px] tracking-widest uppercase font-light">
              Core Tools
            </span>
            <div className="flex text-pictus-lime gap-4 items-center">
              <Figma className="w-4 h-4" strokeWidth={1.5} />
              <ReactIcon className="w-[22px] h-[22px]" />
              <Image src="/icons/hero-js.png" alt="JavaScript" width={16} height={16} className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(82%) sepia(47%) saturate(532%) hue-rotate(30deg) brightness(101%) contrast(91%)' }} />
              <Image src="/icons/hero-threejs.png" alt="Three.js" width={22} height={22} className="w-[22px] h-[22px]" style={{ filter: 'brightness(0) saturate(100%) invert(82%) sepia(47%) saturate(532%) hue-rotate(30deg) brightness(101%) contrast(91%)' }} />
              <NextjsIcon className="w-4 h-4" />
              <N8nIcon className="w-[22px] h-[22px]" />
            </div>
          </div>

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

export default HomeFooter
