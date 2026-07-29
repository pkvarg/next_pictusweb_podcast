'use client'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

type ProcessRow = { title: string; summary: string }

const images = [
  '/pictus/process/step-1.jpg',
  '/pictus/process/step-2.jpg',
  '/pictus/process/step-3.jpg',
  '/pictus/process/step-4.jpg',
]

const PictusProcess = () => {
  const t = useTranslations('Landing')
  const rows = t.raw('process.rows') as ProcessRow[]
  const [active, setActive] = useState(0)

  return (
    <section className="section-shell section-muted" id="process" aria-labelledby="process-title">
      <div className="layout-container">
        <header className="section-heading">
          <p className="section-kicker">{t('process.kicker')}</p>
          <h2 id="process-title">{t('process.title')}</h2>
        </header>

        <div className="process-module">
          <div className="process-content">
            <div className="process-selector" role="tablist" aria-label={t('process.kicker')}>
              {rows.map((row, index) => (
                <React.Fragment key={row.title}>
                  <button
                    className={`process-row${index === active ? ' is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={index === active}
                    onClick={() => setActive(index)}
                  >
                    <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="process-row-copy">
                      <span className="process-row-title">{row.title}</span>
                      <span className="process-row-summary">{row.summary}</span>
                    </span>
                  </button>
                  {index === active && (
                    <div className="process-visual-inline">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={images[active]} width={1800} height={1800} alt="" loading="lazy" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="process-visual-frame" aria-live="polite">
            <div className="process-visual is-active">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[active]} width={1800} height={1800} alt="" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PictusProcess
