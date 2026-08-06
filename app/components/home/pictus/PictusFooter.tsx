'use client'
import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

// homeBase is empty on the landing page (pure in-page hash anchors with smooth
// scroll) and set to `/{locale}` on subpages so the section links navigate home.
const PictusFooter = ({ homeBase = '' }: { homeBase?: string }) => {
  const t = useTranslations('Landing')

  const explore = [
    { href: `${homeBase}#services`, label: t('nav.services') },
    { href: `${homeBase}/projects`, label: t('footer.portfolio') },
    { href: `${homeBase}#process`, label: t('nav.process') },
    { href: `${homeBase}#contact`, label: t('nav.contact') },
  ]

  const services = [
    { href: `${homeBase}#services`, label: t('footer.service1') },
    { href: `${homeBase}#services`, label: t('footer.service2') },
    { href: `${homeBase}#services`, label: t('footer.service3') },
    { href: `${homeBase}/fleetsync`, label: t('footer.service4') },
  ]

  return (
    <footer className="site-footer">
      <div className="layout-container footer-inner">
        <div className="footer-top">
          <div className="footer-brand-col">
            <a className="brand footer-brand" href={homeBase || '#top'} aria-label="Pictus home">
              <Image src="/pictus/pictus-icon.png" width={30} height={30} alt="" />
              <span>{t('footer.brand')}</span>
            </a>
            <address className="footer-contact">
              <span className="footer-col-title">{t('footer.contactLabel')}</span>
              <a href="tel:+421948024638">+421 948 024 638</a>
              <a href="mailto:info@pictusweb.sk">info@pictusweb.sk</a>
            </address>
            <a className="footer-client-link" href={`${homeBase}/client`}>
              {t('footer.forClients')} <span aria-hidden="true">→</span>
            </a>
          </div>

          <nav className="footer-col" aria-label={t('footer.navAria')}>
            <span className="footer-col-title">{t('footer.exploreLabel')}</span>
            {explore.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <nav className="footer-col" aria-label={t('footer.servicesAria')}>
            <span className="footer-col-title">{t('nav.services')}</span>
            {services.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="footer-credit">© {new Date().getFullYear()} Pictusweb</p>
          <nav className="footer-legal" aria-label={t('footer.legalAria')}>
            <a href={`${homeBase}/contact`}>{t('footer.contact')}</a>
            <a href={`${homeBase}/gdpr`}>GDPR</a>
            <a href={`${homeBase}/trade-rules`}>{t('footer.terms')}</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default PictusFooter
