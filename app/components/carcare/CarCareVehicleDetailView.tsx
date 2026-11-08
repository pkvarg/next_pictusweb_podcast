'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Car,
  ChevronRight,
  Gauge,
  Plus,
  Wallet,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import { ACTION_LABEL, templateName, powertrainLabel } from '@/lib/carcare/labels'

export interface VdOccurrence {
  id: string
  status: string
  dueDate: string | null
  dueMileage: number | null
  overdue?: boolean
  recurringEvent: { id: string; name: string; category: string; kind: string; actionType: string }
  appointment: { scheduledAt: string; provider: { id: string; name: string } | null } | null
}

export interface VdHistory {
  id: string
  name: string
  category: string
  completedAt: string | null
  completedMileage: number | null
  cost: number
  currency: string | null
}

export interface VdSuggestion {
  id: string
  key: string
  category: string
  kind: string
  actionType: string
}

export interface VehicleDetailData {
  vehicle: {
    id: string
    registration: string
    nickname: string | null
    make: string | null
    model: string | null
    year: number | null
    powertrain: string | null
    country: string | null
    vin: string | null
    note: string | null
    image: string | null
  }
  occurrences: VdOccurrence[]
  history: VdHistory[]
  costThisYear: number
  latestMileage: { kilometers: number; date: string } | null
  suggestions: VdSuggestion[]
  canModify?: boolean
}

const toneClass = {
  red: 'bg-red-500/15 text-red-300 border border-red-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  neutral: 'bg-white/5 text-gray-300 border border-white/10',
  lime: 'bg-pictus-lime/15 text-pictus-lime border border-pictus-lime/30',
}

function daysUntil(iso: string | null) {
  return iso == null ? null : Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
}
function formatDate(iso: string | null) {
  return iso == null ? '—' : new Date(iso).toLocaleDateString('sk-SK')
}
function vehicleName(v: VehicleDetailData['vehicle']) {
  return v.nickname || [v.make, v.model].filter(Boolean).join(' ') || v.registration
}
function dueBadge(o: VdOccurrence): { text: string; tone: keyof typeof toneClass } {
  const d = daysUntil(o.dueDate)
  if (o.overdue) return { text: d != null ? `Po termíne (${d} dní)` : 'Po termíne', tone: 'red' }
  if (o.status === 'ARRANGED') return { text: 'Naplánované', tone: 'lime' }
  if (o.status === 'ACTION_REQUIRED') return { text: 'Vyžaduje akciu', tone: 'amber' }
  if (d != null) return { text: `Za ${d} dní`, tone: 'neutral' }
  return { text: 'Nadchádzajúce', tone: 'neutral' }
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-pictus-white text-right">{value}</span>
    </div>
  )
}

export default function CarCareVehicleDetailView({ data }: { data: VehicleDetailData }) {
  const { vehicle } = data
  const canModify = data.canModify !== false
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [activated, setActivated] = useState<Set<string>>(new Set())

  const activate = async (key: string) => {
    setBusyKey(key)
    try {
      const res = await fetch('/api/carcare/events/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: vehicle.id, templateKey: key }),
      })
      if (res.ok) setActivated((prev) => new Set(prev).add(key))
    } finally {
      setBusyKey(null)
    }
  }

  const specs: { label: string; value: string }[] = [
    { label: 'ŠPZ', value: vehicle.registration },
    vehicle.make || vehicle.model
      ? { label: 'Značka a model', value: [vehicle.make, vehicle.model].filter(Boolean).join(' ') }
      : null,
    vehicle.year ? { label: 'Rok výroby', value: String(vehicle.year) } : null,
    vehicle.powertrain ? { label: 'Pohon', value: powertrainLabel(vehicle.powertrain) } : null,
    vehicle.vin ? { label: 'VIN', value: vehicle.vin } : null,
    vehicle.country ? { label: 'Krajina', value: vehicle.country } : null,
  ].filter((x): x is { label: string; value: string } => x != null)

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <Link
          href="/carcare"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-pictus-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Späť
        </Link>

        <header className="flex items-start gap-4 mb-8">
          {vehicle.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.image}
              alt={vehicleName(vehicle)}
              className="w-20 h-14 rounded-2xl object-cover shrink-0 border border-white/[0.06]"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-pictus-lime/15 flex items-center justify-center shrink-0">
              <Car className="w-7 h-7 text-pictus-lime" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-light truncate">{vehicleName(vehicle)}</h1>
            <p className="text-gray-400">
              {vehicle.registration}
              {vehicle.year ? ` · ${vehicle.year}` : ''}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
            <div className="text-gray-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-pictus-white">
              {data.latestMileage
                ? `${data.latestMileage.kilometers.toLocaleString('sk-SK')}`
                : '—'}
              <span className="text-base font-normal text-gray-400"> km</span>
            </div>
            <div className="text-xs text-gray-400">
              {data.latestMileage ? `k ${formatDate(data.latestMileage.date)}` : 'Bez záznamu'}
            </div>
          </div>
          <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
            <div className="text-gray-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-pictus-white">
              {data.costThisYear.toFixed(0)} €
            </div>
            <div className="text-xs text-gray-400">Náklady tento rok</div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Udalosti</h2>
          {data.occurrences.length === 0 ? (
            <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
              Žiadne otvorené udalosti.
            </div>
          ) : (
            <div className="space-y-3">
              {data.occurrences.map((o) => {
                const badge = dueBadge(o)
                const actionable = o.status === 'ACTION_REQUIRED' || o.overdue
                const inner = (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="text-pictus-white font-medium truncate">
                        {o.recurringEvent.name}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {o.appointment
                          ? `Návšteva ${formatDate(o.appointment.scheduledAt)}${o.appointment.provider ? ` · ${o.appointment.provider.name}` : ''}`
                          : o.dueDate
                            ? `Termín ${formatDate(o.dueDate)}`
                            : o.dueMileage
                              ? `Pri ${o.dueMileage.toLocaleString('sk-SK')} km`
                              : 'Bez termínu'}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${toneClass[badge.tone]}`}
                    >
                      {badge.text}
                    </span>
                    {canModify && actionable ? (
                      <span className="shrink-0 bg-pictus-lime text-pictus-black text-sm font-semibold px-4 py-1.5 rounded-full">
                        {ACTION_LABEL[o.recurringEvent.actionType] ?? 'Zobraziť'}
                      </span>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                    )}
                  </>
                )
                const base =
                  'w-full text-left flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors'
                return (
                  <Link key={o.id} href={`/carcare/events/${o.recurringEvent.id}`} className={base}>
                    {inner}
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {canModify && data.suggestions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Odporúčané sledovať</h2>
            <div className="space-y-3">
              {data.suggestions.map((s) => {
                const done = activated.has(s.key)
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-pictus-white font-medium truncate">
                        {templateName(s.key)}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {s.kind === 'LEGAL' ? 'Zákonná povinnosť' : 'Odporúčané'}
                      </p>
                    </div>
                    {done ? (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-sm text-pictus-lime">
                        <CheckCircle2 className="w-4 h-4" /> Pridané
                      </span>
                    ) : (
                      <button
                        onClick={() => activate(s.key)}
                        disabled={busyKey === s.key}
                        className="shrink-0 inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-pictus-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/10 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" /> Sledovať
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {data.history.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">História</h2>
            <div className="space-y-3">
              {data.history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
                >
                  <CalendarCheck className="w-5 h-5 text-gray-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-pictus-white font-medium truncate">{h.name}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {formatDate(h.completedAt)}
                      {h.completedMileage
                        ? ` · ${h.completedMileage.toLocaleString('sk-SK')} km`
                        : ''}
                    </p>
                  </div>
                  {h.cost > 0 && (
                    <span className="shrink-0 text-sm text-gray-300">
                      {h.cost.toFixed(0)} {h.currency ?? '€'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {vehicle.note && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Poznámka</h2>
            <div className="p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-300 whitespace-pre-wrap">
              {vehicle.note}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-3">Detaily vozidla</h2>
          <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06]">
            {specs.map((s) => (
              <SpecRow key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
