'use client'
import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

// homeBase is empty on the landing page (pure in-page hash anchors with smooth
// scroll) and set to `/{locale}` on subpages so the section links navigate home.
const PictusFooter = ({ homeBase = '' }: { homeBase?: string }) => {
  const t = useTranslations('Landing')

  return (
    <footer className="site-footer">
      <div className="layout-container footer-shell">
        <div className="footer-brand-column">
          <a className="brand footer-brand" href={homeBase || '#top'} aria-label="Pictus home">
            <Image src="/pictus/PictusMOSS.svg" width={28} height={28} alt="" />
            <span>{t('footer.brand')}</span>
          </a>
          <address className="footer-contact">
            <strong>{t('footer.contactLabel')}</strong>
            <a href="tel:+421948024638">+421 948 024 638</a>
            <a href="mailto:info@pictusweb.sk">info@pictusweb.sk</a>
          </address>
          <a className="footer-client-link" href={`${homeBase}/client`}>
            {t('footer.forClients')}
          </a>
        </div>

        <nav className="footer-nav footer-main-nav" aria-label={t('footer.navAria')}>
          <a href={`${homeBase}#services`}>{t('nav.services')}</a>
          <a href={`${homeBase}#about`}>{t('nav.about')}</a>
          <a href={`${homeBase}#selected-work`}>{t('footer.portfolio')}</a>
          <a href={`${homeBase}#process`}>{t('nav.process')}</a>
        </nav>

        <nav className="footer-nav footer-service-nav" aria-label={t('footer.servicesAria')}>
          <a href={`${homeBase}#services`}>{t('footer.service1')}</a>
          <a href={`${homeBase}#services`}>{t('footer.service2')}</a>
          <a href={`${homeBase}#services`}>{t('footer.service3')}</a>
          <a href={`${homeBase}#services`}>{t('footer.service4')}</a>
        </nav>

        <p className="footer-credit">© {new Date().getFullYear()} Pictusweb</p>
        <nav className="footer-legal" aria-label={t('footer.legalAria')}>
          <a href={`${homeBase}/gdpr`}>GDPR</a>
          <a href={`${homeBase}/trade-rules`}>{t('footer.terms')}</a>
        </nav>
      </div>
    </footer>
  )
}

export default PictusFooter
