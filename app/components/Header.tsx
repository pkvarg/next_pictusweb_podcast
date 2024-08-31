'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import LanguageBar from './LanguageBar'
import { useTranslations } from 'next-intl'

const Header = () => {
  const [navbar, setNavbar] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const t = useTranslations('Home')
  const { locale } = useParams()

  return (
    <nav
      id='navbar'
      className={
        isSticky
          ? 'sticky top-0  w-full text-white nav-font bg-[#768c51] z-9999'
          : 'top-0  w-full text-white nav-font'
      }
    >
      <div className='justify-between px-4 mx-auto md:items-center md:flex md:px-8'>
        <div className='mb-0 lg:mb-2'>
          <div className='flex items-center justify-between py-3 md:py-5 md:block'>
            <a className='text-[22.5px] lg:text-[22.5px] font-light' href='/'>
              &#60;&#47;&#62; PICTUSWEB development
            </a>
            <div className='md:hidden'>
              <button
                className='p-2 text-white rounded-md outline-none focus:border-gray-400 focus:border'
                onClick={() => setNavbar(!navbar)}
              >
                {navbar ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-10 h-10'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-10 h-10'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M4 6h16M4 12h16M4 18h16'
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div>
          <div
            className={`flex-1 justify-self-center h-[80vh] lg:h-auto pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
              navbar ? 'block' : 'hidden'
            }`}
          >
            <ul className='text-[22.5px] lg:text-[22.5px] font-light justify-center space-y-4 md:flex md:space-x-6 md:space-y-0'>
              <li>
                <Link
                  href={`${locale}/#projects`}
                  className='hover:text-[#0388f4]'
                >
                  {t('navbarProjects')}
                </Link>
              </li>

              <li>
                <Link
                  href={`${locale}/podcast`}
                  className='hover:text-[#0388f4]'
                >
                  {t('podcastsTitle')}
                </Link>
              </li>

              <li>
                <Link
                  href={`${locale}/contact`}
                  className='hover:text-[#0388f4]'
                >
                  {t('navbarContact')}
                </Link>
              </li>

              <li>
                <LanguageBar />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
