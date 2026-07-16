'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

const PictusHero = () => {
  const t = useTranslations('Landing')

  return (
    <section className="section-shell hero" aria-labelledby="hero-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="hero-background"
        src="/pictus/backgrounds/hero.png"
        width={3415}
        height={2084}
        alt=""
        fetchPriority="high"
        aria-hidden="true"
      />
      <div className="hero-scrim" aria-hidden="true"></div>

      <div className="layout-container hero-content">
        <div className="section-copy hero-copy motion-layer">
          <h1 id="hero-title">{t('hero.title')}</h1>
          <div className="hero-action-copy">
            <p className="section-lede">{t('hero.lede')}</p>
            <div className="button-row" aria-label={t('hero.actionsAria')}>
              <a className="button button-primary" href="#contact">
                {t('hero.cta')} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PictusHero
