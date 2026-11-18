'use client'
import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { ChevronDown, Menu, X } from 'lucide-react'

const languages = [
  { code: 'sk', label: 'SK', flag: '🇸🇰' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'hu', label: 'HU', flag: '🇭🇺' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
]

const PagesHeader = () => {
  const t = useTranslations('Home')
  const tl = useTranslations('Landing')
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const currentLang = pathname.slice(1, 3)
  const langPath = pathname.slice(4)
  const cleanPath = pathname.replace(/^\/(en|sk|hu|de)/, '')

  const switchLanguage = (code: string) => {
    router.replace(`/${code}/${langPath}`)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const navLinks = [
    { href: '/', label: t('navbarHome') },
    { href: '/fleetsync', label: t('navbarAutomatizations') },
    { href: '/projects', label: t('navbarProjects') },
    { href: '/podcasts', label: t('navbarPodcasts') },
    { href: '/contact', label: t('navbarContact') },
  ]

  const isActive = (href: string) =>
    href === '/' ? cleanPath === '' || cleanPath === '/' : cleanPath.startsWith(href)

  return (
    <header className="relative z-40 bg-transparent" aria-label="Site header">
      <div className="mx-auto flex min-h-[76px] w-[min(100%-2rem,1296px)] items-center justify-between gap-3 md:min-h-[90px] md:gap-6">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Pictus home">
          <Image src="/pictus/pictus-icon.png" width={32} height={32} alt="" />
          <span className="text-[1.35rem] font-bold leading-none text-pictus-white min-[380px]:text-[1.6rem] md:text-[2rem]">
            Pictusweb
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex min-h-[44px] items-center text-[1.02rem] font-semibold transition-colors hover:text-pictus-white ${
                isActive(link.href) ? 'text-pictus-white' : 'text-pictus-white/90'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative flex items-center sm:hidden">
            <select
              aria-label={tl('nav.changeLanguage')}
              value={currentLang}
              onChange={(event) => switchLanguage(event.target.value)}
              className="h-11 cursor-pointer appearance-none rounded-full bg-pictus-onyx900 pl-3.5 pr-8 text-[0.92rem] font-bold text-pictus-white"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-2.5 h-4 w-4 text-pictus-white/70"
            />
          </div>

          <div className="hidden h-11 items-center gap-0.5 rounded-full bg-pictus-onyx900 px-1.5 sm:inline-flex">
            {languages.map((lang) => {
              const active = currentLang === lang.code
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => switchLanguage(lang.code)}
                  aria-pressed={active}
                  className={`inline-flex h-[34px] items-center gap-1.5 rounded-full px-2.5 text-[0.92rem] font-bold leading-none transition-colors ${
                    active
                      ? 'text-pictus-white ring-1 ring-inset ring-pictus-lime'
                      : 'text-pictus-white/70 hover:bg-white/5 hover:text-pictus-white'
                  }`}
                >
                  <span className="hidden sm:inline" aria-hidden="true">
                    {lang.flag}
                  </span>
                  <span>{lang.label}</span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Menu"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-pictus-onyx900 md:hidden ${
              menuOpen
                ? 'text-pictus-lime ring-1 ring-inset ring-pictus-lime/50'
                : 'text-pictus-white/80'
            }`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mx-auto w-[min(100%-2rem,1296px)] pb-4 md:hidden">
          <nav className="flex flex-col gap-1 rounded-2xl bg-pictus-onyx900 p-3 ring-1 ring-inset ring-pictus-lime/25">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-pictus-white/80 transition-colors hover:bg-pictus-lime/10 hover:text-pictus-lime"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default PagesHeader
