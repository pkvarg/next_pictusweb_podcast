'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

const PictusAbout = () => {
  const t = useTranslations('Landing')

  return (
    <section className="section-shell" id="about" aria-labelledby="about-title">
      <div className="layout-container">
        <header className="section-heading">
          <p className="section-kicker">{t('about.kicker')}</p>
          <h2 id="about-title">{t('about.title')}</h2>
        </header>

        <div className="about-module">
          <div className="about-visual-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="about-visual"
              src="/pictus/backgrounds/about1.webp"
              width={1600}
              height={1054}
              alt=""
              loading="lazy"
            />
          </div>

          <div className="about-copy">
            <p>{t('about.text')}</p>
            <a className="button button-primary" href="#contact">
              {t('about.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PictusAbout
