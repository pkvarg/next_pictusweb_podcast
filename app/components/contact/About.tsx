'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

const About = () => {
  const t = useTranslations('Home')
  return (
    <section className="section-shell section-muted" id="about" aria-labelledby="about-title">
      <div className="layout-container">
        <header className="section-heading fs-heading">
          <h2 id="about-title">{t('contactAboutTitle')}</h2>
        </header>

        <div className="contact-about">
          <div className="contact-about-col">
            <strong>Pictusweb s.r.o.</strong>
            <p>Nábrežná 42</p>
            <p>Nové Zámky</p>
            <p>940 02</p>
            <p>{t('contactAboutSR')}</p>
            <p style={{ paddingTop: 8 }}>+421 948 024 638</p>
            <p>IČO: 54631068</p>
            <p>DIČ: 2121741424</p>
          </div>

          <div className="contact-about-col">
            <strong>{t('contactAboutAccount')}</strong>
            <p className="mono">SK68 8330 0000 0022 0221 4313</p>
            <p style={{ paddingTop: 8 }}>{t('contactAboutReg1')}</p>
            <p>{t('contactAboutReg2')}</p>
            <p>{t('contactAboutReg3')}</p>
            <p>{t('contactAboutReg4')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
