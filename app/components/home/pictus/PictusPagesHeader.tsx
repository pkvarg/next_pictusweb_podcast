'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Menu, X } from 'lucide-react'

const languages = [
  { code: 'sk', label: 'SK', flag: '🇸🇰' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'hu', label: 'HU', flag: '🇭🇺' },
]

const PictusPagesHeader = () => {
  const t = useTranslations('Home')
  const tl = useTranslations('Landing')
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const currentLang = pathname.slice(1, 3)
  const path = pathname.slice(4)
  const cleanPath = pathname.replace(/^\/(en|sk|hu)/, '')

  const switchLanguage = (code: string) => {
    router.replace(`/${code}/${path}`)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
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

  return (
    <header className="site-header" aria-label="Site header">
      <div className="layout-container nav-shell">
        <Link className="brand site-brand" href="/" aria-label="Pictus home">
          <Image src="/pictus/PictusMOSS.svg" width={32} height={32} alt="" />
        </Link>

        <nav
          className={`primary-nav${menuOpen ? ' is-open' : ''}`}
          id="primary-nav"
          aria-label="Pictusweb"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) setMenuOpen(false)
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                cleanPath === link.href || (link.href !== '/' && cleanPath.startsWith(link.href))
                  ? 'page'
                  : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-controls">
          <div className="language-inline" role="group" aria-label={tl('nav.changeLanguage')}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                className={currentLang === lang.code ? 'is-active' : ''}
                aria-pressed={currentLang === lang.code}
                onClick={() => switchLanguage(lang.code)}
              >
                <span className="lang-flag" aria-hidden="true">
                  {lang.flag}
                </span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
          <button
            className="menu-control"
            type="button"
            aria-controls="primary-nav"
            aria-label={tl('nav.menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default PictusPagesHeader
