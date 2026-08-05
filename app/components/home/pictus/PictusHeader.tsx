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

const PictusHeader = () => {
  const t = useTranslations('Landing')
  const th = useTranslations('Home')
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const currentLang = pathname.slice(1, 3)
  const path = pathname.slice(4)

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

  return (
    <header className="site-header" aria-label="Site header">
      <div className="layout-container nav-shell">
        <a className="brand site-brand" href="#top" aria-label="Pictus home">
          <Image src="/pictus/PictusMOSS.svg" width={32} height={32} alt="" />
        </a>

        <nav
          className={`primary-nav${menuOpen ? ' is-open' : ''}`}
          id="primary-nav"
          aria-label={t('nav.aria')}
          onClick={(event) => {
            if ((event.target as HTMLElement).tagName === 'A') setMenuOpen(false)
          }}
        >
          <Link href="/fleetsync">FleetSync</Link>
          <Link href="/podcasts">{th('navbarPodcasts')}</Link>
          <Link href="/projects">{t('nav.work')}</Link>
          <Link href="/contact">{t('nav.contact')}</Link>
        </nav>

        <div className="nav-controls">
          <div className="language-inline" role="group" aria-label={t('nav.changeLanguage')}>
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
            aria-label={t('nav.menu')}
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

export default PictusHeader
