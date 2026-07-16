'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { ArrowUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

interface TierInfo {
  id: string
  name: string
  usersLimit: number
  vehiclesLimit: number
  notificationsLimit: number
  templatesLimit: number
  notificationTypesLimit: number
}

interface Organization {
  id: string
  name: string
  tierId: string | null
  tierRelation?: TierInfo
  purchasedVehicles: number | null
  billingInterval: string | null
  stripeSubscriptionStatus: string | null
}

interface PricingTier {
  name: string
  pricePerVehicle: number
  pricePerVehicleYearly: number
  vehiclesLimit: number
}

export default function UpgradePage() {
  const { data: session } = useSession()
  const t = useTranslations('Client')
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'sk'

  const [canceled, setCanceled] = useState(false)
  const [org, setOrg] = useState<Organization | null>(null)
  const [pricing, setPricing] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState('')

  const [targetTier, setTargetTier] = useState<'BASIC' | 'BUSINESS'>('BUSINESS')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [vehicleCount, setVehicleCount] = useState(1)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('canceled') === '1'
    ) {
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
        if (data.organizations?.[0]) {
          const orgData = data.organizations[0]
          setOrg(orgData)
          setVehicleCount(orgData.purchasedVehicles || 1)
          if (orgData.billingInterval) setBillingInterval(orgData.billingInterval)
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

  const currentTierName = org?.tierRelation?.name || 'FREE'
  const isPayingUser = currentTierName !== 'FREE' && !!org?.billingInterval
  const maxVehicles = targetTier === 'BASIC' ? 3 : 999

  // Determine available upgrade targets
  const isYearlySubscriber = isPayingUser && org?.billingInterval === 'yearly'
  const availableTargets: ('BASIC' | 'BUSINESS')[] = []
  if (currentTierName === 'FREE') {
    availableTargets.push('BASIC', 'BUSINESS')
  } else if (currentTierName === 'BASIC' && !isYearlySubscriber) {
    availableTargets.push('BUSINESS')
  }

  const selectedPricing = pricing.find((p) => p.name === targetTier)
  const pricePerVehicle =
    billingInterval === 'yearly'
      ? selectedPricing?.pricePerVehicleYearly || 0
      : selectedPricing?.pricePerVehicle || 0
  const totalPrice = pricePerVehicle * vehicleCount
  const periodLabel =
    billingInterval === 'yearly' ? t('upgradePeriodYear') : t('upgradePeriodMonth')

  const handleUpgrade = async () => {
    setUpgrading(true)
    setError('')

    try {
      const res = await fetch('/api/organizations/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTier,
          billingInterval,
          purchasedVehicles: vehicleCount,
          locale,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('upgradeError'))
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.success) {
        router.push(`/${locale}/client?upgraded=1&from=${currentTierName}`)
      }
    } catch (err) {
      setError(t('upgradeError'))
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-pictus-lime" />
      </div>
    )
  }

  if (availableTargets.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-pictus-onyx900 rounded-3xl p-8 border border-white/[0.06] text-center">
          {isYearlySubscriber ? (
            <>
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-light text-white mb-2">
                {t('upgradeYearlyContactTitle')}
              </h2>
              <p className="text-gray-400">{t('upgradeYearlyContactDescription')}</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 text-pictus-lime mx-auto mb-4" />
              <h2 className="text-2xl font-light text-white mb-2">{t('upgradeHighestTier')}</h2>
              <p className="text-gray-400">
                {t('upgradeAlreadyOn', { tierName: currentTierName })}
              </p>
            </>
          )}
          <Link
            href="/client"
            className="inline-block mt-6 px-6 py-3 bg-pictus-lime text-pictus-black font-semibold rounded-full hover:bg-pictus-lime600 transition-all"
          >
            {t('upgradeBackToDashboard')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-white mb-2">{t('upgradePageTitle')}</h1>
        <p className="text-gray-400">{t('upgradeCurrentPlan', { tierName: currentTierName })}</p>
      </div>

      {canceled && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm">{t('upgradePaymentCanceled')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-pictus-onyx900 rounded-3xl p-6 border border-white/[0.06] space-y-6">
        {/* Tier Selection */}
        {availableTargets.length > 1 && (
          <div>
            <label className="text-sm text-gray-400 mb-2 block">{t('upgradeSelectPlan')}</label>
            <div className="grid grid-cols-2 gap-3">
              {availableTargets.map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    setTargetTier(tier)
                    const max = tier === 'BASIC' ? 3 : 999
                    setVehicleCount((v) => Math.min(v, max))
                  }}
                  className={`p-4 rounded-2xl border transition-all text-left ${
                    targetTier === tier
                      ? 'border-pictus-lime bg-pictus-lime/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <p className="font-medium text-lg">{tier}</p>
                  <p className="text-sm mt-1 opacity-70">
                    {t('upgradeVehiclePerMonth', {
                      price: pricing.find((p) => p.name === tier)?.pricePerVehicle || 0,
                    })}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Billing Interval */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">{t('upgradeBillingPeriod')}</label>
          {isPayingUser ? (
            <div className="p-3 rounded-xl border border-pictus-lime bg-pictus-lime/10 text-white">
              {billingInterval === 'monthly' ? t('upgradeMonthly') : t('upgradeYearly')}
              <span className="text-xs text-gray-400 ml-2">{t('upgradeBillingLocked')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`p-3 rounded-xl border transition-all ${
                  billingInterval === 'monthly'
                    ? 'border-pictus-lime bg-pictus-lime/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                {t('upgradeMonthly')}
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`p-3 rounded-xl border transition-all ${
                  billingInterval === 'yearly'
                    ? 'border-pictus-lime bg-pictus-lime/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
              >
                {t('upgradeYearly')}
              </button>
            </div>
          )}
        </div>

        {/* Vehicle Count */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">{t('upgradeVehicles')}</label>
          <input
            type="number"
            min={1}
            max={isPayingUser ? 100 : maxVehicles}
            value={vehicleCount}
            onChange={(e) => {
              const max = isPayingUser ? 100 : maxVehicles
              setVehicleCount(Math.min(max, Math.max(1, parseInt(e.target.value) || 1)))
            }}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white text-lg focus:ring-2 focus:ring-pictus-lime focus:outline-none transition-all"
          />
          {isPayingUser && (
            <p className="text-xs text-gray-500 mt-1">{t('upgradeVehicleMax100')}</p>
          )}
        </div>

        {/* Price Summary */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/[0.06]">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              {t('upgradePriceSummary', {
                count: vehicleCount,
                price: pricePerVehicle,
                period: periodLabel,
              })}
            </span>
            <span className="text-2xl font-light text-white">
              {totalPrice}&euro;
              <span className="text-sm text-gray-400">
                /{billingInterval === 'yearly' ? 'yr' : 'mo'}
              </span>
            </span>
          </div>
          {isPayingUser && (
            <p className="text-xs text-gray-500 mt-2">{t('upgradeNextCycleNote')}</p>
          )}
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 text-pictus-black font-semibold rounded-full transition-all text-lg"
        >
          {upgrading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ArrowUp className="w-5 h-5" />
          )}
          {upgrading ? t('upgradeProcessing') : t('upgradeButton', { tierName: targetTier })}
        </button>

        {/* Support note for paying users */}
        {isPayingUser && (
          <p className="text-sm text-white text-center mt-4">{t('upgradeContactSupport')}</p>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/client" className="text-gray-400 hover:text-white transition-all text-sm">
          &larr; {t('upgradeBackToDashboard')}
        </Link>
      </div>
    </div>
  )
}
