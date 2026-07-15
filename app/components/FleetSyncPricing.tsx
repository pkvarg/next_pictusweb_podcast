'use client'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { Link } from '@/i18n/routing'

interface FleetSyncPricingProps {
  translations: {
    pricingTitle: string
    pricingTitleHighlight: string
    pricingSubtitle: string
    monthly: string
    yearly: string
    yearlySave: string
    perVehicle: string
    perMonth: string
    perYear: string
    free: string
    freeFeatures: string[]
    freeButton: string
    freeContact: string
    freePlanLimit: string
    basic: string
    basicFeatures: string[]
    basicButton: string
    basicContact: string
    basicPopular: string
    business: string
    businessFeatures: string[]
    businessButton: string
    businessContact: string
  }
}

const PRICING = {
  FREE: { monthly: 0, yearly: 0 },
  BASIC: { monthly: 2, yearly: 20 },
  BUSINESS: { monthly: 3, yearly: 30 },
} as const

const FleetSyncPricing = ({ translations: t }: FleetSyncPricingProps) => {
  const [isYearly, setIsYearly] = useState(false)

  const basicPrice = isYearly ? PRICING.BASIC.yearly : PRICING.BASIC.monthly
  const businessPrice = isYearly ? PRICING.BUSINESS.yearly : PRICING.BUSINESS.monthly
  const billing = isYearly ? 'yearly' : 'monthly'

  return (
    <section className="section-shell" id="pricing">
      <div className="layout-container">
        <header className="section-heading fs-heading">
          <p className="section-kicker">{t.pricingTitleHighlight}</p>
          <h2>{t.pricingTitle}</h2>
          <p>{t.pricingSubtitle}</p>
        </header>

        <div className="fs-billing">
          <span className={`fs-billing-label${!isYearly ? ' is-active' : ''}`}>{t.monthly}</span>
          <button
            type="button"
            className={`fs-toggle${isYearly ? ' is-on' : ''}`}
            onClick={() => setIsYearly((v) => !v)}
            aria-label={`${t.monthly} / ${t.yearly}`}
            aria-pressed={isYearly}
          >
            <span className="fs-toggle-knob" />
          </button>
          <span className={`fs-billing-label${isYearly ? ' is-active' : ''}`}>{t.yearly}</span>
          {isYearly && <span className="fs-save-badge">{t.yearlySave}</span>}
        </div>

        <div className="fs-plans">
          {/* FREE */}
          <div className="fs-plan">
            <h3>{t.free}</h3>
            <div className="fs-plan-price">
              <span className="fs-amount">€0</span>
            </div>
            <p className="fs-plan-sub">{t.perVehicle}</p>
            <ul className="fs-plan-features">
              {t.freeFeatures.filter(Boolean).map((feature, i) => (
                <li key={i}>
                  <Check /> <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/fleetsync/get-started?tier=FREE&billing=${billing}`}
              className="button button-secondary"
            >
              {t.freeButton}
            </Link>
          </div>

          {/* BASIC — popular */}
          <div className="fs-plan is-popular">
            <span className="fs-plan-badge">{t.basicPopular}</span>
            <h3>{t.basic}</h3>
            <div className="fs-plan-price">
              <span className="fs-amount">€{basicPrice}</span>
              <span className="fs-period">{isYearly ? t.perYear : t.perMonth}</span>
            </div>
            <p className="fs-plan-sub">{t.perVehicle}</p>
            <ul className="fs-plan-features">
              {t.basicFeatures.filter(Boolean).map((feature, i) => (
                <li key={i}>
                  <Check /> <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/fleetsync/get-started?tier=BASIC&billing=${billing}`}
              className="button button-primary"
            >
              {t.basicButton}
            </Link>
          </div>

          {/* BUSINESS */}
          <div className="fs-plan">
            <h3>{t.business}</h3>
            <div className="fs-plan-price">
              <span className="fs-amount">€{businessPrice}</span>
              <span className="fs-period">{isYearly ? t.perYear : t.perMonth}</span>
            </div>
            <p className="fs-plan-sub">{t.perVehicle}</p>
            <ul className="fs-plan-features">
              {t.businessFeatures.filter(Boolean).map((feature, i) => (
                <li key={i}>
                  <Check /> <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/fleetsync/get-started?tier=BUSINESS&billing=${billing}`}
              className="button button-secondary"
            >
              {t.businessButton}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FleetSyncPricing
