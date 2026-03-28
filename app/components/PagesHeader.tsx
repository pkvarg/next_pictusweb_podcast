'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import LanguageBar from './LanguageBar'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

const PagesHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('Home')
  const { locale } = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentLang = pathname.slice(1, 3)
  const langPath = pathname.slice(4)

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'sk', label: 'SK' },
    { code: 'hu', label: 'HU' },
  ]

  const isActive = (path: string) => {
    // Remove locale prefix from pathname for comparison
    const cleanPath = pathname.replace(/^\/(en|sk|hu)/, '')

    return cleanPath.startsWith(path)
  }

  return (
    <>
      {/* Mobile hamburger - fixed position for z-index */}
      <button
        className="md:hidden text-white fixed top-6 right-6 z-50 p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#161616]/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <nav className="flex flex-col items-center gap-6">
              <Link
                href="/fleetsync"
                className="text-[#F8F8F8] text-xl tracking-widest uppercase font-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('navbarAutomatizations')}
              </Link>
              <Link
                href="/projects"
                className="text-[#F8F8F8] text-xl tracking-widest uppercase font-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('navbarProjects')}
              </Link>
              <Link
                href="/podcasts"
                className="text-[#F8F8F8] text-xl tracking-widest uppercase font-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('navbarPodcasts')}
              </Link>
              <Link
                href="/contact"
                className="text-[#F8F8F8] text-xl tracking-widest uppercase font-light"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('navbarContact')}
              </Link>
            </nav>
            <div className="flex items-center gap-4 mt-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`text-lg font-medium transition-colors ${
                    currentLang === lang.code
                      ? 'text-pictus-lime'
                      : 'text-[#F8F8F8]/50 hover:text-white'
                  }`}
                  onClick={() => {
                    router.replace(`/${lang.code}/${langPath}`)
                    setMobileMenuOpen(false)
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav id="navbar" className="w-full text-white bg-transparent px-6 md:px-12 pt-7 md:pt-1">
        <div className="flex w-full items-center justify-between"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/">
              <Image src="/logo-pictusweb.svg" alt="Pictusweb" width={50} height={50} className="hidden md:block" />
              <Image src="/logo-pictusweb.svg" alt="Pictusweb" width={36} height={36} className="md:hidden" />
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
                href={`/projects`}
                className={`text-[14px] tracking-widest uppercase font-light hover:text-[#F8F8F8] transition-colors ${
                  isActive('/projects') ? 'text-[#F8F8F8] font-medium' : 'text-[#F8F8F8]/70'
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
        </div>
      </nav>
    </>
  )
}

export default PagesHeader
