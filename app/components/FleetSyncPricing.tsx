'use client'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
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

const FleetSyncPricing = ({ translations: t }: FleetSyncPricingProps) => {
  const [isYearly, setIsYearly] = useState(false)

  const basicMonthly = 2
  const businessMonthly = 3
  const yearlyDiscount = 0.83 // ~17% off (10 months for 12)

  const basicPrice = isYearly ? +(basicMonthly * 12 * yearlyDiscount).toFixed(0) : basicMonthly
  const businessPrice = isYearly ? +(businessMonthly * 12 * yearlyDiscount).toFixed(0) : businessMonthly

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light mb-6">
            {t.pricingTitle}{' '}
            <span className="text-purple-400">{t.pricingTitleHighlight}</span>
          </h2>
          <p className="text-2xl text-gray-300 font-thin">{t.pricingSubtitle}</p>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-lg ${!isYearly ? 'text-white font-medium' : 'text-gray-400'}`}>
            {t.monthly}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-16 h-8 rounded-full transition-colors ${isYearly ? 'bg-purple-600' : 'bg-gray-600'}`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${isYearly ? 'translate-x-9' : 'translate-x-1'}`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${isYearly ? 'text-white font-medium' : 'text-gray-400'}`}>
              {t.yearly}
            </span>
            {isYearly && (
              <span className="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full border border-green-500/30">
                {t.yearlySave}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FREE */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gray-500/30">
            <h3 className="text-2xl font-semibold mb-2">{t.free}</h3>
            <div className="text-4xl font-bold mb-1">
              €0
            </div>
            <p className="text-gray-400 mb-6 text-sm">{t.perVehicle}</p>
            <ul className="space-y-3 mb-8">
              {t.freeFeatures.filter(Boolean).map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/contact?subject=${encodeURIComponent(t.freeContact)}`}
              className="block w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full transition-colors text-center"
            >
              {t.freeButton}
            </Link>
          </div>

          {/* BASIC - Popular */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-purple-500/60 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-1 rounded-full text-sm font-medium">
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
            <ul className="space-y-3 mb-8">
              {t.basicFeatures.filter(Boolean).map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/contact?subject=${encodeURIComponent(t.basicContact)}`}
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full transition-all transform hover:scale-105 text-center"
            >
              {t.basicButton}
            </Link>
          </div>

          {/* BUSINESS */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gray-500/30">
            <h3 className="text-2xl font-semibold mb-2">{t.business}</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">€{businessPrice}</span>
              <span className="text-lg text-gray-400 font-thin">
                {isYearly ? t.perYear : t.perMonth}
              </span>
            </div>
            <p className="text-gray-400 mb-6 text-sm">{t.perVehicle}</p>
            <ul className="space-y-3 mb-8">
              {t.businessFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/contact?subject=${encodeURIComponent(t.businessContact)}`}
              className="block w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full transition-colors text-center"
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
