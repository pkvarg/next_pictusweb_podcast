'use client'
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
//import Link from 'next/link'
import { Link } from '@/i18n/routing'
import LanguageBar from './LanguageBar'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const PagesHeader = () => {
  const [navbar, setNavbar] = useState(false)
  const t = useTranslations('Home')
  const { locale } = useParams()
  const pathname = usePathname()

  const isActive = (path: string) => {
    // Remove locale prefix from pathname for comparison
    const cleanPath = pathname.replace(/^\/(en|sk|hu)/, '')

    if (path === '/#projects') {
      // For anchor links, check if we're on home page
      return cleanPath === '' || cleanPath === '/'
    }

    return cleanPath.startsWith(path)
  }

  return (
    <nav id="navbar" className="w-full text-white bg-transparent px-6 md:px-12 pt-1">
      <div className="flex w-full items-center justify-between"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/">
            <Image src="/PictusLIME.webp" alt="Pictusweb" width={50} height={50} className="hidden md:block" />
            <span className="md:hidden text-[#F8F8F8] text-xl font-bold tracking-tight">PICTUSWEB</span>
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <Link
              href={`/fleetsync`}
              className={`text-[14px] tracking-widest uppercase font-light hover:text-[#F8F8F8] transition-colors ${
                isActive('/fleetsync') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
              }`}
            >
              {t('navbarAutomatizations')}
            </Link>
            <Link
              href={`/#projects`}
              className={`text-[14px] tracking-widest uppercase font-light hover:text-[#F8F8F8] transition-colors ${
                isActive('/#projects') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
              }`}
            >
              {t('navbarProjects')}
            </Link>
            <Link
              href={`/podcasts`}
              className={`text-[14px] tracking-widest uppercase font-light hover:text-[#F8F8F8] transition-colors ${
                isActive('/podcasts') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
              }`}
            >
              {t('navbarPodcasts')}
            </Link>
            <Link
              href={`/contact`}
              className={`text-[14px] tracking-widest uppercase font-light hover:text-[#F8F8F8] transition-colors ${
                isActive('/contact') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
              }`}
            >
              {t('navbarContact')}
            </Link>
          </div>
        </div>
        <div className="hidden md:block">
          <LanguageBar />
        </div>
        <div className="md:hidden">
          <button
            className="p-2 text-white rounded-md outline-none"
            onClick={() => setNavbar(!navbar)}
          >
            {navbar ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {navbar && (
        <div className="md:hidden py-4 flex flex-col items-center gap-4">
          <Link href="/fleetsync" className="text-[#F8F8F8] text-lg tracking-widest uppercase font-light" onClick={() => setNavbar(false)}>
            {t('navbarAutomatizations')}
          </Link>
          <Link href="/#projects" className="text-[#F8F8F8] text-lg tracking-widest uppercase font-light" onClick={() => setNavbar(false)}>
            {t('navbarProjects')}
          </Link>
          <Link href="/podcasts" className="text-[#F8F8F8] text-lg tracking-widest uppercase font-light" onClick={() => setNavbar(false)}>
            {t('navbarPodcasts')}
          </Link>
          <Link href="/contact" className="text-[#F8F8F8] text-lg tracking-widest uppercase font-light" onClick={() => setNavbar(false)}>
            {t('navbarContact')}
          </Link>
          <LanguageBar />
        </div>
      )}
    </nav>
  )
}

export default PagesHeader
