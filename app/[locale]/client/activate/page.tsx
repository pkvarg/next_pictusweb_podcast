'use client'

import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { CreditCard, Loader2, AlertCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

interface PricingTier {
  name: string
  pricePerVehicle: number
  pricePerVehicleYearly: number
  vehiclesLimit: number
}

export default function ActivatePage() {
  const { data: session } = useSession()
  const t = useTranslations('Client')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  const [canceled, setCanceled] = useState(false)
  const [tierName, setTierName] = useState('')
  const [vehicleCount, setVehicleCount] = useState(1)
  const [pricing, setPricing] = useState<PricingTier[]>([])
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('canceled') === '1') {
      setCanceled(true)
    }
  }, [])

  const fetchData = useCallback(async () => {
    const orgId = (session?.user as any)?.organization
    if (!orgId) return

    try {
      const [orgRes, pricingRes] = await Promise.all([
        fetch(`/api/organizations?id=${orgId}`),
        fetch('/api/tiers/pricing'),
      ])

      if (orgRes.ok) {
        const data = await orgRes.json()
        const orgData = data.organizations?.[0]
        if (orgData) {
          setVehicleCount(orgData.purchasedVehicles || 1)
          setTierName(orgData.tierRelation?.name || 'BASIC')
        }
      }

      if (pricingRes.ok) {
        const data = await pricingRes.json()
        setPricing(data.pricing || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session) fetchData()
  }, [session, fetchData])

  const selectedPricing = pricing.find((p) => p.name === tierName)
  const pricePerVehicle = billingInterval === 'yearly'
    ? (selectedPricing?.pricePerVehicleYearly || 0)
    : (selectedPricing?.pricePerVehicle || 0)
  const maxVehicles = tierName === 'BASIC' ? 3 : 999
  const totalPrice = pricePerVehicle * vehicleCount
  const periodLabel = billingInterval === 'yearly' ? t('activatePeriodYear') : t('activatePeriodMonth')

  const handleActivate = async () => {
    setActivating(true)
    setError('')

    try {
      const res = await fetch('/api/organizations/activate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingInterval, purchasedVehicles: vehicleCount }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('activateError'))
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      setError(t('activateError'))
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-pictus-lime" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-white mb-2">{t('activatePageTitle')}</h1>
        <p className="text-gray-400">
          {t('activatePageSubtitle', { tierName })}
        </p>
      </div>

      {canceled && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm">{t('activatePaymentCanceled')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
        {/* Plan info */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-gray-400 text-sm">{t('activateYourPlan')}</p>
          <p className="text-white text-2xl font-light mt-1">{tierName}</p>
        </div>

        {/* Billing Interval */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">{t('activateBillingPeriod')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`p-3 rounded-lg border transition-all ${
                billingInterval === 'monthly'
                  ? 'border-pictus-lime bg-pictus-lime/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              {t('activateMonthly')}
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`p-3 rounded-lg border transition-all ${
                billingInterval === 'yearly'
                  ? 'border-pictus-lime bg-pictus-lime/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              {t('activateYearly')}
            </button>
          </div>
        </div>

        {/* Vehicle Count */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">{t('activateVehicles')}</label>
          <input
            type="number"
            min={1}
            max={maxVehicles}
            value={vehicleCount}
            onChange={(e) => setVehicleCount(Math.min(maxVehicles, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg"
          />
        </div>

        {/* Price Summary */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              {t('activatePriceSummary', { count: vehicleCount, price: pricePerVehicle, period: periodLabel })}
            </span>
            <span className="text-2xl font-light text-white">
              {totalPrice}&euro;<span className="text-sm text-gray-400">/{billingInterval === 'yearly' ? 'yr' : 'mo'}</span>
            </span>
          </div>
        </div>

        {/* Activate Button */}
        <button
          onClick={handleActivate}
          disabled={activating}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 text-pictus-black rounded-lg transition-all font-medium text-lg"
        >
          {activating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CreditCard className="w-5 h-5" />
          )}
          {activating ? t('activateProcessing') : t('activatePayButton')}
        </button>
      </div>

      <div className="mt-6 text-center">
        <Link href="/client" className="text-gray-400 hover:text-white transition-all text-sm">
          &larr; {t('activateBackToDashboard')}
        </Link>
      </div>
    </div>
  )
}
