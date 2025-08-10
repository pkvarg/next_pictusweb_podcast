// 'use client'
// import { motion } from 'framer-motion'
// import { footerVariants } from '@/lib/motion'
// import { useTranslations } from 'next-intl'
// import { useParams } from 'next/navigation'
// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { updateVisitors } from '@/lib/visitorsCounter'
// import CookieConsent from 'react-cookie-consent'

// const Footer = () => {
//   const t = useTranslations('Home')
//   const { locale } = useParams()
//   const path = usePathname()
//   const page = path.slice(4)

//   const increaseVisitors = async () => {
//     await updateVisitors()
//   }

//   return (
//     <div className='mx-8 mt-16'>
//       <CookieConsent
//         location='bottom'
//         style={{
//           background: '#834daf',
//           color: '#ffffff',
//           fontSize: '19px',
//           textAlign: 'start',
//         }}
//         buttonStyle={{
//           background: '#1d9f2f',
//           color: '#fff',
//           fontSize: '18px',
//           paddingTop: '9px',
//           paddingLeft: '40px',
//           paddingRight: '40px',
//           borderRadius: '20px',
//         }}
//         buttonText='OK'
//         expires={365}
//         enableDeclineButton
//         onDecline={() => {
//           increaseVisitors()
//         }}
//         declineButtonStyle={{
//           background: 'red',
//           color: '#fff',
//           fontSize: '18px',
//           paddingTop: '7.5px',
//           borderRadius: '20px',
//         }}
//         declineButtonText={t('cookiesDisagree')}
//         onAccept={() => {
//           increaseVisitors()
//         }}
//       >
//         {t('cookies')}
//       </CookieConsent>
//       <motion.footer
//         variants={footerVariants}
//         initial='hidden'
//         whileInView='show'
//       >
//         <div className={`flex flex-col gap-8`}>
//           <div className='mb-[10px] h-[2px] bg-white opacity-10' />

//           <div className='flex flex-col text-[20px] font-light'>
//             <div className='flex lg:flex-row flex-col items-center justify-between flex-wrap gap-4 mx-0  lg:mx-12'>
//               <div className='flex lg:flex-row flex-col gap-2 justify-center items-center'>
//                 <h4 className='flex-nowrap text-white'>
//                   Copyright &copy; {Date().substring(11, 15)}
//                 </h4>
//                 <h4 className=' text-white'>Pictusweb s.r.o.</h4>
//               </div>
//               <Link
//                 className=' text-white hover:text-[#0388f4]'
//                 href={
//                   page !== 'contact' ? `/${locale}/contact/#about` : `#about`
//                 }
//               >
//                 {locale === 'sk' ? 'O firme' : 'About'}
//               </Link>

//               <a
//                 className='text-white hover:text-[#0388f4]'
//                 href={page !== 'contact' ? `/${locale}/contact/#gdpr` : `#gdpr`}
//               >
//                 GDPR
//               </a>
//               {locale === 'sk' && (
//                 <a
//                   className='text-white hover:text-[#0388f4]'
//                   href={
//                     page !== 'contact'
//                       ? `/${locale}/contact/#trade-rules`
//                       : `#trade-rules`
//                   }
//                 >
//                   Obchodné podmienky
//                 </a>
//               )}

//               <p className='font-normal text-white  text-[17.5px] opacity-50'>
//                 WhatsApp: +421 904 798 505
//                 <br />
//                 <a href='mailto:info@pictusweb.sk'>email: info@pictusweb.sk</a>
//               </p>
//             </div>
//           </div>
//         </div>
//       </motion.footer>
//       <div className='bg:hero-gradient h-10'></div>
//     </div>
//   )
// }

// export default Footer

'use client'
import { motion } from 'framer-motion'
import { footerVariants } from '@/lib/motion'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { updateVisitors } from '@/lib/visitorsCounter'
import CookieConsent from 'react-cookie-consent'

const Footer = () => {
  const t = useTranslations('Home')
  const { locale } = useParams()
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
          background: '#834daf',
          color: '#ffffff',
          fontSize: '19px',
          textAlign: 'start',
        }}
        buttonStyle={{
          background: '#1d9f2f',
          color: '#fff',
          fontSize: '18px',
          paddingTop: '9px',
          paddingLeft: '40px',
          paddingRight: '40px',
          borderRadius: '20px',
        }}
        buttonText="OK"
        expires={365}
        enableDeclineButton
        onDecline={() => {
          increaseVisitors()
        }}
        declineButtonStyle={{
          background: 'red',
          color: '#fff',
          fontSize: '18px',
          paddingTop: '7.5px',
          borderRadius: '20px',
        }}
        declineButtonText={t('cookiesDisagree')}
        onAccept={() => {
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

              <p className="text-gray-400 text-xl font-thin">
                Automatizujeme procesy slovenských firiem <br /> pomocou moderných AI technológií.
              </p>
              <h4 className="flex-nowrap text-gray-400 font-thin !text-[20px] mt-2">
                Copyright &copy; {new Date().getFullYear()} Pictusweb s.r.o.
              </h4>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Služby</h3>
              <ul className="space-y-2  text-gray-400 text-xl font-thin">
                <li>
                  <a href="/" className="hover:text-purple-300 transition-colors">
                    Weby
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-purple-300 transition-colors">
                    Eshopy
                  </a>
                </li>
                <li>
                  <a
                    href="/vozidla-notifikacie"
                    className="hover:text-purple-300 transition-colors"
                  >
                    Automatizácia vozidiel
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-purple-300 transition-colors">
                    AI služby
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-purple-300 transition-colors">
                    Blogy
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-purple-300 transition-colors">
                    Podcasty
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">O nás</h3>
              <div className="flex flex-col gap-2">
                <Link
                  className=" text-gray-400 hover:text-[#0388f4] transition-colors font-thin text-xl"
                  href={page !== 'contact' ? `/${locale}/contact/#about` : `#about`}
                >
                  {locale === 'sk' ? 'O firme' : 'About'}
                </Link>
                <a
                  className="text-gray-400 hover:text-[#0388f4] transition-colors font-thin text-xl"
                  href={page !== 'contact' ? `/${locale}/contact/#gdpr` : `#gdpr`}
                >
                  GDPR
                </a>
                {locale === 'sk' && (
                  <a
                    className="text-gray-400 hover:text-[#0388f4] transition-colors font-thin text-xl"
                    href={page !== 'contact' ? `/${locale}/contact/#trade-rules` : `#trade-rules`}
                  >
                    Obchodné podmienky
                  </a>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Kontakt</h3>
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

                <li>💬 WhatsApp: +421 904 798 505</li>
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
