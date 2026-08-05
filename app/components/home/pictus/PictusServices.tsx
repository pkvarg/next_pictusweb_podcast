'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

type ServiceRow = { title: string; summary: string; alt: string }

// Service rows whose CTA overrides the default "/projects" link with a more
// specific destination.
const PODCASTS_INDEX = 2
const FLEETSYNC_INDEX = 3
const SUPPORT_INDEX = 4

const images = [
  '/pictus/services/web.webp',
  '/pictus/services/web-redesign.webp',
  '/pictus/services/podcasts.webp',
  '/pictus/services/fleetsync.webp',
  '/pictus/services/support.webp',
]

const PictusServices = () => {
  const t = useTranslations('Landing')
  const { locale } = useParams()
  const rows = t.raw('services.rows') as ServiceRow[]
  const [active, setActive] = useState(0)

  let ctaHref = `/${locale as string}/projects`
  let ctaLabel = t('services.visualButton')
  if (active === PODCASTS_INDEX) {
    ctaHref = `/${locale as string}/podcasts`
    ctaLabel = t('services.podcastsButton')
  } else if (active === FLEETSYNC_INDEX) {
    ctaHref = `/${locale as string}/fleetsync`
    ctaLabel = t('services.fleetsyncButton')
  } else if (active === SUPPORT_INDEX) {
    ctaHref = '#contact'
    ctaLabel = t('services.contactButton')
  }

  return (
    <section className="section-shell" id="services" aria-labelledby="services-title">
      <div className="layout-container">
        <header className="section-heading">
          <p className="section-kicker">{t('services.kicker')}</p>
          <h2 id="services-title">{t('services.title')}</h2>
          <p>{t('services.subtitle')}</p>
        </header>

        <div className="services-module">
          <div className="services-content">
            <div className="service-selector" role="tablist" aria-label={t('services.kicker')}>
              {rows.map((row, index) => (
                <React.Fragment key={row.title}>
                  <button
                    className={`service-row${index === active ? ' is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={index === active}
                    onClick={() => setActive(index)}
                  >
                    <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="service-row-copy">
                      <span className="service-row-title">{row.title}</span>
                      <span className="service-row-summary">{row.summary}</span>
                    </span>
                  </button>
                  {index === active && (
                    <div className="service-visual-inline">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[active]}
                        width={1800}
                        height={1800}
                        alt={rows[active]?.alt ?? ''}
                        loading="lazy"
                      />
                      <a className="service-visual-link" href={ctaHref}>
                        {ctaLabel}
                        <span className="service-link-arrow" aria-hidden="true">
                          →
                        </span>
                      </a>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="services-visual-frame" aria-live="polite">
            <div className="service-visual is-active" key={active}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[active]}
                width={1800}
                height={1800}
                alt={rows[active]?.alt ?? ''}
                loading="lazy"
              />
              <a className="service-visual-link" href={ctaHref}>
                {ctaLabel}
                <span className="service-link-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PictusServices
