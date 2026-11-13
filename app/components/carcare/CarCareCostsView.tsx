'use client'

import { useTranslations } from 'next-intl'
import { Wallet, CalendarCheck, Receipt, Gift } from 'lucide-react'
import { categoryKey } from '@/lib/carcare/labels'
import { formatDate } from '@/lib/carcare/datetime'
import FleetExpenseAnalytics from '@/app/components/client/FleetExpenseAnalytics'

export interface CostEntry {
  id: string
  source: 'event' | 'expense'
  title: string
  category: string
  date: string
  amount: number
  currency: string
  vehicle: { id: string; name: string; registration: string }
}

export interface CostsData {
  totals: { thisYear: number; allTime: number }
  byVehicle: { id: string; name: string; registration: string; total: number }[]
  byCategory: { category: string; total: number }[]
  entries: CostEntry[]
  fleetAnalytics?: {
    entitled: boolean
    gifted: boolean
    orgName: string | null
    vehicles: {
      id: string
      registration: string
      type: string
      expenses: { id: string; item: string; cost: number; date: string }[]
    }[]
  }
}

function eur(n: number) {
  return `${n.toLocaleString('sk-SK', { maximumFractionDigits: 0 })} €`
}

function Bar({ label, amount, max }: { label: string; amount: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((amount / max) * 100)) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-pictus-white">{label}</span>
        <span className="text-sm text-gray-300">{eur(amount)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full bg-pictus-lime" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function CarCareCostsView({ data }: { data: CostsData }) {
  const t = useTranslations('CarCare')
  const catMax = Math.max(0, ...data.byCategory.map((c) => c.total))
  const vehMax = Math.max(0, ...data.byVehicle.map((v) => v.total))
  const empty = data.entries.length === 0

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-light">{t('costs.title')}</h1>
          <p className="text-gray-400">{t('costs.subtitle')}</p>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
            <div className="text-pictus-lime">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-pictus-white">{eur(data.totals.thisYear)}</div>
            <div className="text-xs text-gray-400">{t('costs.thisYear')}</div>
          </div>
          <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
            <div className="text-gray-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-pictus-white">{eur(data.totals.allTime)}</div>
            <div className="text-xs text-gray-400">{t('costs.allTime')}</div>
          </div>
        </div>

        {empty ? (
          <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
            {t('costs.empty')}
          </div>
        ) : (
          <>
            {data.byCategory.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3">{t('costs.byCategory')}</h2>
                <div className="bg-pictus-onyx900 rounded-2xl p-5 border border-white/[0.06] space-y-4">
                  {data.byCategory.map((c) => (
                    <Bar
                      key={c.category}
                      label={categoryKey(c.category) ? t(categoryKey(c.category)!) : c.category}
                      amount={c.total}
                      max={catMax}
                    />
                  ))}
                </div>
              </section>
            )}

            {data.byVehicle.length > 1 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3">{t('costs.byVehicle')}</h2>
                <div className="bg-pictus-onyx900 rounded-2xl p-5 border border-white/[0.06] space-y-4">
                  {data.byVehicle.map((v) => (
                    <Bar
                      key={v.id}
                      label={`${v.name} · ${v.registration}`}
                      amount={v.total}
                      max={vehMax}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-xl font-bold mb-3">{t('costs.recent')}</h2>
              <div className="space-y-3">
                {data.entries.map((e) => (
                  <div
                    key={`${e.source}-${e.id}`}
                    className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-gray-400">
                      {e.source === 'event' ? (
                        <CalendarCheck className="w-4 h-4" />
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-pictus-white font-medium truncate">{e.title}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {e.vehicle.name} · {formatDate(e.date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-pictus-white font-medium">
                      {e.amount.toLocaleString('sk-SK', { maximumFractionDigits: 0 })}{' '}
                      {e.currency === 'EUR' ? '€' : e.currency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {data.fleetAnalytics?.entitled && (
          <section className="mt-10">
            {data.fleetAnalytics.gifted && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-pictus-lime/15 border border-pictus-lime/40 text-pictus-lime">
                <Gift className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{t('costs.analyticsGifted')}</span>
              </div>
            )}
            <FleetExpenseAnalytics vehiclesData={data.fleetAnalytics.vehicles} />
          </section>
        )}
      </div>
    </div>
  )
}
