'use client'
import { motion } from 'framer-motion'
import { footerVariants } from '@/lib/motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { usePathname } from 'next/navigation'
import { updateVisitors } from '@/lib/visitorsCounter'
import CookieConsent from 'react-cookie-consent'

const Footer = () => {
  const t = useTranslations('Home')
  const path = usePathname()
  const page = path.slice(4)

  const increaseVisitors = async () => {
    await updateVisitors()
  }

  return (
    <div className="mx-8 mt-16">
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
      <motion.footer variants={footerVariants} initial="hidden" whileInView="show">
        <div className={`flex flex-col gap-8`}>
          {/* Extended Footer Section with Services */}
          <div className="mb-[10px] h-[2px] bg-white opacity-10" />
          <div className="flex flex-col lg:flex-row justify-center gap:8 lg:gap-16 mb-8">
            <div>
              <div className="text-xl font-light mb-4 text-white">
                &lt;/&gt; PICTUSWEB development
              </div>

              <p className="text-gray-400 text-xl font-thin">{t('companyDescription1')}</p>
              <p className="text-gray-400 text-xl font-thin">{t('companyDescription2')}</p>
              <h4 className="flex-nowrap text-gray-400 font-thin !text-[20px] mt-2">
                Copyright &copy; {new Date().getFullYear()} Pictusweb s.r.o.
              </h4>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">{t('footerCategory1')}</h3>
              <ul className="space-y-2  text-gray-400 text-xl font-thin">
                <li>
                  <Link href="/#offer" className="hover:text-purple-300 transition-colors">
                    {t('footerService1')}
                  </Link>
                </li>
                <li>
                  <Link href="/#offer" className="hover:text-purple-300 transition-colors">
                    {t('footerService2')}
                  </Link>
                </li>
                <li>
                  <Link href="/#offer" className="hover:text-purple-300 transition-colors">
                    {t('footerService3')}
                  </Link>
                </li>
                <li>
                  <Link href="/#offer" className="hover:text-purple-300 transition-colors">
                    {t('footerService4')}
                  </Link>
                </li>
                <li>
                  <Link href="/#offer" className="hover:text-purple-300 transition-colors">
                    {t('footerService5')}
                  </Link>
                </li>
                <li>
                  <Link href={`/fleetsync`} className="hover:text-purple-300 transition-colors">
                    {t('footerService6')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">{t('footerCategory2')}</h3>
              <div className="flex flex-col gap-2">
                <Link
                  className=" text-gray-400 hover:text-[#0388f4] transition-colors font-thin text-xl"
                  href={page !== 'contact' ? `/contact/#about` : `#about`}
                >
                  {t('navbarAbout')}
                </Link>
                <a
                  className="text-gray-400 hover:text-[#0388f4] transition-colors font-thin text-xl"
                  href={page !== 'contact' ? `/contact/#gdpr` : `#gdpr`}
                >
                  GDPR
                </a>

                <a
                  className="text-gray-400 hover:text-[#0388f4] transition-colors font-thin text-xl"
                  href={page !== 'contact' ? `/contact/#trade-rules` : `#trade-rules`}
                >
                  {t('footerTradeRules')}
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">{t('footerCategory3')}</h3>
              <ul className="space-y-2 text-xl font-thin text-gray-400">
                <li>
                  📧{' '}
                  <a
                    href="mailto:info@pictusweb.sk"
                    className="hover:text-purple-300 transition-colors"
                  >
                    info@pictusweb.sk
                  </a>
                </li>

                <li>+421 948 024 638</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">{t('footerForClients')}</h3>
              <ul className="space-y-2 text-xl font-thin text-gray-400">
                <li>
                  <Link href="/client" className="hover:text-purple-300 transition-colors">
                    {t('footerForClients')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.footer>
      <div className="bg:hero-gradient h-10"></div>
    </div>
  )
}

export default Footer
