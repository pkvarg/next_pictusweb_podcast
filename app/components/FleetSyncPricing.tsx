'use client'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'

interface TierPricing {
  name: string
  pricePerVehicle: number
  pricePerVehicleYearly: number | null
  yearlyDiscount: number
}

interface FleetSyncPricingProps {
  pricing: TierPricing[]
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

const FleetSyncPricing = ({ pricing, translations: t }: FleetSyncPricingProps) => {
  const [isYearly, setIsYearly] = useState(false)

  const getPricing = (tierName: string) => pricing.find((p) => p.name === tierName)
  const basicTier = getPricing('BASIC')
  const businessTier = getPricing('BUSINESS')

  const basicMonthly = basicTier?.pricePerVehicle ?? 2
  const businessMonthly = businessTier?.pricePerVehicle ?? 3
  const yearlyDiscount = basicTier?.yearlyDiscount ?? 0.83

  const basicPrice = isYearly
    ? basicTier?.pricePerVehicleYearly != null
      ? basicTier.pricePerVehicleYearly
      : +(basicMonthly * 12 * yearlyDiscount).toFixed(0)
    : basicMonthly
  const businessPrice = isYearly
    ? businessTier?.pricePerVehicleYearly != null
      ? businessTier.pricePerVehicleYearly
      : +(businessMonthly * 12 * yearlyDiscount).toFixed(0)
    : businessMonthly

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light mb-6">
            {t.pricingTitle} <span className="text-pictus-lime">{t.pricingTitleHighlight}</span>
          </h2>
          <p className="text-2xl text-gray-300 font-thin">{t.pricingSubtitle}</p>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-lg ${!isYearly ? 'text-pictus-white font-medium' : 'text-gray-400'}`}
          >
            {t.monthly}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-16 h-8 rounded-full transition-colors ${isYearly ? 'bg-pictus-lime' : 'bg-gray-600'}`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${isYearly ? 'translate-x-9' : 'translate-x-1'}`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg ${isYearly ? 'text-pictus-white font-medium' : 'text-gray-400'}`}
            >
              {t.yearly}
            </span>
            {isYearly && (
              <span className="bg-pictus-lime/20 text-pictus-lime text-sm px-3 py-1 rounded-full border border-pictus-lime/30">
                {t.yearlySave}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FREE */}
          <div className="bg-pictus-white/5 backdrop-blur-sm rounded-3xl p-8 border border-pictus-white/10 flex flex-col">
            <h3 className="text-2xl font-semibold mb-2">{t.free}</h3>
            <div className="text-4xl font-bold mb-1">€0</div>
            <p className="text-gray-400 mb-6 text-sm">{t.perVehicle}</p>
            <ul className="space-y-3 mb-8 flex-grow">
              {t.freeFeatures.filter(Boolean).map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {/* <p className="text-xs text-yellow-400/80 mb-4 flex items-start gap-1.5">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              {t.freePlanLimit}
            </p> */}
            <Link
              href={`/fleetsync/get-started?tier=FREE&billing=${isYearly ? 'yearly' : 'monthly'}`}
              className="block w-full bg-pictus-white/10 hover:bg-pictus-white/20 px-6 py-3 rounded-full transition-colors text-center mt-auto"
            >
              {t.freeButton}
            </Link>
          </div>

          {/* BASIC - Popular */}
          <div className="bg-pictus-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-pictus-lime/40 relative flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-6 py-1 rounded-full text-sm font-medium text-pictus-black">
              {t.basicPopular}
            </div>
            <h3 className="text-2xl font-semibold mb-2">{t.basic}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">€{basicPrice}</span>
              <span className="text-lg text-gray-400 font-thin">
                {isYearly ? t.perYear : t.perMonth}
              </span>
            </div>
            <p className="text-gray-400 mb-6 text-sm">{t.perVehicle}</p>
            <ul className="space-y-3 mb-8 flex-grow">
              {t.basicFeatures.filter(Boolean).map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {/* <Link
              href={`/contact?subject=${encodeURIComponent(t.basicContact)}`}
              className="block w-full bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black font-normal px-6 py-3 rounded-full transition-all transform hover:scale-105 text-center mt-auto shadow-lg hover:shadow-pictus-lime/50"
            >
              {t.basicButton}
            </Link> */}
            <Link
              href={`/fleetsync/get-started?tier=BASIC&billing=${isYearly ? 'yearly' : 'monthly'}`}
              className="block w-full bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black font-normal px-6 py-3 rounded-full transition-all transform hover:scale-105 text-center mt-auto shadow-lg hover:shadow-pictus-lime/50"
            >
              {t.basicButton}
            </Link>
          </div>

          {/* BUSINESS */}
          <div className="bg-pictus-white/5 backdrop-blur-sm rounded-3xl p-8 border border-pictus-white/10 flex flex-col">
            <h3 className="text-2xl font-semibold mb-2">{t.business}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">€{businessPrice}</span>
              <span className="text-lg text-gray-400 font-thin">
                {isYearly ? t.perYear : t.perMonth}
              </span>
            </div>
            <p className="text-gray-400 mb-6 text-sm">{t.perVehicle}</p>
            <ul className="space-y-3 mb-8 flex-grow">
              {t.businessFeatures.filter(Boolean).map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {/* <Link
              href={`/contact?subject=${encodeURIComponent(t.businessContact)}`}
              className="block w-full bg-pictus-white/10 hover:bg-pictus-white/20 px-6 py-3 rounded-full transition-colors text-center mt-auto"
            >
              {t.businessButton}
            </Link> */}
            <Link
              href={`/fleetsync/get-started?tier=BUSINESS&billing=${isYearly ? 'yearly' : 'monthly'}`}
              className="block w-full bg-pictus-white/10 hover:bg-pictus-white/20 px-6 py-3 rounded-full transition-colors text-center mt-auto"
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
