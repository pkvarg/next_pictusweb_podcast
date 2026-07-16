'use client'
import React, { useState } from 'react'
import { Link } from '@/i18n/routing'
import LanguageBar from './LanguageBar'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const Header = () => {
  const [navbar, setNavbar] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const t = useTranslations('Home')
  const pathname = usePathname()

  const isActive = (path: string) => {
    // Remove locale prefix from pathname for comparison
    const cleanPath = pathname.replace(/^\/(en|sk|hu)/, '')

    return cleanPath.startsWith(path)
  }

  return (
    <nav
      id="navbar"
      className={
        isSticky
          ? 'sticky top-0  w-full text-white nav-font bg-[#768c51] z-9999'
          : 'top-0  w-full text-white nav-font'
      }
    >
      <div className="justify-between px-4 mx-auto md:items-center md:flex md:px-8">
        <div className="mb-0 lg:mb-2">
          <div className="flex items-center justify-between py-3 md:py-5 md:block">
            <Link href="/">
              <Image src="/logo-pictusweb.svg" alt="Pictusweb" width={64} height={64} />
            </Link>
            <div className="md:hidden">
              <button
                className="p-2 text-white rounded-md outline-none focus:border-gray-400 focus:border"
                onClick={() => setNavbar(!navbar)}
              >
                {navbar ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
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
            <ul className="text-[14px] tracking-widest uppercase font-light justify-center space-y-4 md:flex md:space-x-6 md:space-y-0 items-center">
              <li>
                <Link
                  href={`/fleetsync`}
                  className={`hover:text-[#F8F8F8] transition-colors ${
                    isActive('/fleetsync') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
                  }`}
                >
                  {t('navbarAutomatizations')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/projects`}
                  className={`hover:text-[#F8F8F8] transition-colors ${
                    isActive('/projects') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
                  }`}
                >
                  {t('navbarProjects')}
                </Link>
              </li>

              <li>
                <Link
                  href={`/podcasts`}
                  className={`hover:text-[#F8F8F8] transition-colors ${
                    isActive('/podcasts') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
                  }`}
                >
                  {t('podcastsTitle')}
                </Link>
              </li>

              <li>
                <Link
                  href={`/contact`}
                  className={`hover:text-[#F8F8F8] transition-colors ${
                    isActive('/contact') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
                  }`}
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
