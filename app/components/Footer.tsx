'use client'
import { motion } from 'framer-motion'
import { footerVariants } from '@/lib/motion'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import axios from 'axios'
import CookieConsent from 'react-cookie-consent'

const Footer = () => {
  const t = useTranslations('Home')
  const { locale } = useParams()
  const path = usePathname()
  const page = path.slice(4)

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const increaseVisitorsDeclined = async () => {
    const { data } = await axios.put(
      `https://api.pictusweb.com/api/visitors/pic/increase`,
      // `http://localhost:2000/api/visitors/pic/increase`,
      config
    )
    console.log('vstrsDec:', data.visitorsDeclined)
  }

  const increaseVisitorsAgreed = async () => {
    const { data } = await axios.put(
      `https://api.pictusweb.com/api/visitors/pic/agree/increase`,
      // `http://localhost:2000/api/visitors/pic/agree/increase`,
      config
    )
    console.log('vstrsAgr:', data.visitorsAgreed)
  }

  return (
    <div className='mx-8 mt-16'>
      <CookieConsent
        location='bottom'
        style={{
          background: '#834daf',
          color: '#ffffff',
          fontSize: '19px',
          textAlign: 'start',
        }}
        buttonStyle={{
          background: '#1d9f2f',
          color: '#fff',
          fontSize: '18px',
          paddingTop: '5px',
        }}
        buttonText='OK'
        expires={365}
        enableDeclineButton
        onDecline={() => {
          increaseVisitorsDeclined()
        }}
        declineButtonStyle={{
          background: 'red',
          color: '#fff',
          fontSize: '18px',
          paddingTop: '5px',
        }}
        declineButtonText={t('cookiesDisagree')}
        onAccept={() => {
          increaseVisitorsAgreed()
        }}
      >
        {t('cookies')}
      </CookieConsent>
      <motion.footer
        variants={footerVariants}
        initial='hidden'
        whileInView='show'
      >
        <div className={`flex flex-col gap-8`}>
          <div className='mb-[10px] h-[2px] bg-white opacity-10' />

          <div className='flex flex-col text-[20px] font-light'>
            <div className='flex lg:flex-row flex-col items-center justify-between flex-wrap gap-4 mx-0  lg:mx-12'>
              <div className='flex lg:flex-row flex-col gap-2 justify-center items-center'>
                <h4 className='flex-nowrap text-white'>
                  Copyright &copy; {Date().substring(11, 15)}
                </h4>
                <h4 className=' text-white'>Pictusweb s.r.o.</h4>
              </div>
              <Link
                className=' text-white hover:text-[#0388f4]'
                href={
                  page !== 'contact' ? `/${locale}/contact/#about` : `#about`
                }
              >
                {locale === 'sk' ? 'O firme' : 'About'}
              </Link>

              <a
                className='text-white hover:text-[#0388f4]'
                href={page !== 'contact' ? `/${locale}/contact/#gdpr` : `#gdpr`}
              >
                GDPR
              </a>
              {locale === 'sk' && (
                <a
                  className='text-white hover:text-[#0388f4]'
                  href={
                    page !== 'contact'
                      ? `/${locale}/contact/#trade-rules`
                      : `#trade-rules`
                  }
                >
                  Obchodné podmienky
                </a>
              )}

              <p className='font-normal text-white  text-[17.5px] opacity-50'>
                WhatsApp: +421 904 798 505
                <br />
                <a href='mailto:info@pictusweb.sk'>email: info@pictusweb.sk</a>
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
      <div className='bg:hero-gradient h-10'></div>
    </div>
  )
}

export default Footer
