'use client'
import { motion } from 'framer-motion'
import { footerVariants } from '@/lib/motion'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Footer = () => {
  const t = useTranslations('Home')
  const { locale } = useParams()
  const path = usePathname()
  const page = path.slice(4)

  console.log(path, page)

  return (
    <div className='mx-8 mt-16'>
      <motion.footer
        variants={footerVariants}
        initial='hidden'
        whileInView='show'
      >
        <div className={`flex flex-col gap-8`}>
          <div className='mb-[10px] h-[2px] bg-white opacity-10' />

          <div className='flex flex-col text-[20px]'>
            <div className='flex lg:flex-row flex-col items-center justify-between flex-wrap gap-4 mx-0  lg:mx-12'>
              <div className='flex lg:flex-row flex-col gap-2 justify-center items-center'>
                <h4 className='font-extrabold  flex-nowrap text-white'>
                  Copyright &copy; {Date().substring(11, 15)}
                </h4>
                <h4 className='font-extrabold text-white'>Pictusweb s.r.o.</h4>
              </div>
              <Link
                className='font-extrabold text-white'
                href={
                  page !== 'contact' ? `${locale}/contact/#about` : `#about`
                }
              >
                O firme
              </Link>

              <a
                className='font-extrabold text-white'
                href={page !== 'contact' ? `${locale}/contact/#gdpr` : `#gdpr`}
              >
                GDPR
              </a>
              <a
                className='font-extrabold text-white'
                href={
                  page !== 'contact'
                    ? `${locale}/contact/#trade-rules`
                    : `#trade-rules`
                }
              >
                Obchodné podmienky
              </a>
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
