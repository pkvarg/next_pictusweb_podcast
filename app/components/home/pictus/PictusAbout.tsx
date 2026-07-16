'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

const PictusAbout = () => {
  const t = useTranslations('Landing')

  return (
    <section className="section-shell section-muted" id="about" aria-labelledby="about-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="about-background"
        src="/pictus/backgrounds/about.png"
        width={1600}
        height={1054}
        alt=""
        loading="lazy"
        aria-hidden="true"
      />
      <div className="layout-container section-grid about-shell">
        <header className="section-heading">
          <h2 id="about-title">{t('about.title')}</h2>
        </header>

        <div className="copy-column about-copy">
          <p>{t('about.text')}</p>
          <a className="button button-primary" href="#contact">
            {t('about.cta')}
          </a>
        </div>
      </div>
    </section>
  )
}

export default PictusAbout
