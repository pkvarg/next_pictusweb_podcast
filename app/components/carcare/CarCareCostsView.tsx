'use client'

import { Wallet, CalendarCheck, Receipt } from 'lucide-react'
import { categoryLabel } from '@/lib/carcare/labels'

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
}

function eur(n: number) {
  return `${n.toLocaleString('sk-SK', { maximumFractionDigits: 0 })} €`
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sk-SK')
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
  const catMax = Math.max(0, ...data.byCategory.map((c) => c.total))
  const vehMax = Math.max(0, ...data.byVehicle.map((v) => v.total))
  const empty = data.entries.length === 0

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-light">Náklady</h1>
          <p className="text-gray-400">Výdavky na vaše vozidlá</p>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
            <div className="text-pictus-lime">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-pictus-white">{eur(data.totals.thisYear)}</div>
            <div className="text-xs text-gray-400">Tento rok</div>
          </div>
          <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
            <div className="text-gray-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-pictus-white">{eur(data.totals.allTime)}</div>
            <div className="text-xs text-gray-400">Celkovo</div>
          </div>
        </div>

        {empty ? (
          <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
            Zatiaľ žiadne zaznamenané náklady.
          </div>
        ) : (
          <>
            {data.byCategory.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3">Podľa kategórie (tento rok)</h2>
                <div className="bg-pictus-onyx900 rounded-2xl p-5 border border-white/[0.06] space-y-4">
                  {data.byCategory.map((c) => (
                    <Bar
                      key={c.category}
                      label={categoryLabel(c.category)}
                      amount={c.total}
                      max={catMax}
                    />
                  ))}
                </div>
              </section>
            )}

            {data.byVehicle.length > 1 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3">Podľa vozidla (tento rok)</h2>
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
              <h2 className="text-xl font-bold mb-3">Posledné náklady</h2>
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
      </div>
    </div>
  )
}
