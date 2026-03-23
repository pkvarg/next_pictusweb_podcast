'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { usePathname, useRouter } from 'next/navigation'
import LanguageBar from '../LanguageBar'

const Hero = () => {
  const t = useTranslations('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const currentLang = pathname.slice(1, 3)
  const langPath = pathname.slice(4)

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'sk', label: 'SK' },
    { code: 'hu', label: 'HU' },
  ]

  return (
    <>
      {/* Mobile hamburger - outside section for z-index */}
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
                FleetSync
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

      <section className="relative isolate min-h-screen overflow-hidden flex flex-col p-6 md:px-12 md:pt-1 md:pb-12 justify-between">
        {/* Top Navigation */}
        <header
          className="flex w-full z-30 items-center justify-between"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="ml-8">
              <Image
                src="/PictusLIME.webp"
                alt="Pictusweb"
                width={50}
                height={50}
                className="hidden md:block"
              />
              <span className="md:hidden text-[#F8F8F8] text-xl font-bold tracking-tight">
                PICTUSWEB
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-10">
              <Link
                href="/fleetsync"
                className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors"
              >
                FleetSync
              </Link>
              <Link
                href="/projects"
                className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors"
              >
                {t('navbarProjects')}
              </Link>
              <Link
                href="/podcasts"
                className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors"
              >
                {t('navbarPodcasts')}
              </Link>
              <Link
                href="/contact"
                className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors"
              >
                {t('navbarContact')}
              </Link>
            </nav>
          </div>
          <div className="hidden md:block">
            <LanguageBar />
          </div>
        </header>

        {/* Testing banner */}
        <div className="relative z-30 mt-4 mx-auto w-fit px-6 py-2.5 rounded-full border border-red-500/50 bg-red-600/20 backdrop-blur-sm">
          <span className="text-red-400 text-[17px] tracking-wide">
            !! {t('testingBanner')}{' '}
            <a
              href="https://www.pictusweb.sk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-red-300 hover:text-white transition-colors font-medium"
            >
              pictusweb.sk
            </a>{' '}
            !!
          </span>
        </div>

        {/* Giant background text */}
        <div
          className="absolute inset-0 hidden md:flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden w-full -translate-x-[7vw] -translate-y-[10vh]"
          aria-hidden="true"
        >
          {/* Desktop: horizontal */}
          <h1 className="font-brutal-milk text-[10vw] leading-[0.85] font-bold text-[#F8F8F8]/90 tracking-[0.04em] whitespace-nowrap mt-8 scale-y-[1.7] origin-center">
            PICTUS<span className="ml-[11vw]">WEB</span>
          </h1>
        </div>

        {/* Centered mascot */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="animate-float"
          >
            <Image
              src="/hero-mascot.png"
              alt="Pictus Mascot"
              width={800}
              height={800}
              priority
              className="h-[60vh] md:h-[75vh] w-auto max-w-none object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Bottom content area */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 0.8)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="flex flex-col md:flex-row justify-between items-end w-full z-30 gap-12 mt-auto pb-4"
        >
          {/* Left: description */}
          <div className="max-w-[420px] w-full">
            <div className="flex items-center gap-6 mb-8">
              <div className="h-px w-10 bg-white/40" />
              <span className="text-[#F8F8F8]/80 text-sm tracking-widest uppercase font-light">
                {t('heroLabel')}
              </span>
            </div>
            <p className="text-[#F8F8F8] text-lg md:text-xl font-light leading-relaxed opacity-90">
              {t('heroSubtitle')}
            </p>
          </div>

        </motion.div>
      </section>
    </>
  )
}

export default Hero
