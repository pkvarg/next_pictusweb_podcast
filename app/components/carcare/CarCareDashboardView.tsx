'use client'

import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  Wallet,
  Car,
  ChevronRight,
  Plus,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import AddEventModal from './AddEventModal'
import AddExpenseModal, { type VehicleOption } from './AddExpenseModal'
import CarCareNotificationBell from './CarCareNotificationBell'

export interface DashOccurrence {
  id: string
  status: string
  dueDate: string | null
  overdue?: boolean
  recurringEvent: { id: string; name: string; category: string; kind: string; actionType: string }
  vehicle: {
    registration: string
    nickname: string | null
    make: string | null
    model: string | null
  }
  appointments?: { scheduledAt: string }[]
}

export interface DashVehicle {
  id: string
  registration: string
  nickname: string | null
  make: string | null
  model: string | null
  year: number | null
  powertrain: string | null
  image: string | null
}

export interface DashboardData {
  counts: { needsAttention: number; upcoming30: number; arranged: number; costThisYear: number }
  needsAttention: DashOccurrence[]
  upcoming: DashOccurrence[]
  vehicles: DashVehicle[]
  canModify?: boolean
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
}

type Tr = (key: string, values?: Record<string, string | number>) => string

function dueLabel(o: DashOccurrence, t: Tr): { text: string; tone: 'red' | 'amber' | 'neutral' } {
  const d = daysUntil(o.dueDate)
  if (o.overdue)
    return {
      text: d != null ? t('badge.overdueDays', { d }) : t('badge.overdue'),
      tone: 'red',
    }
  if (o.status === 'ARRANGED') return { text: t('badge.arranged'), tone: 'neutral' }
  if (o.status === 'ACTION_REQUIRED') return { text: t('badge.actionReq'), tone: 'red' }
  if (d != null) return { text: t('badge.inDays', { d }), tone: 'neutral' }
  return { text: t('badge.upcoming'), tone: 'neutral' }
}

const toneClass = {
  red: 'bg-red-500/15 text-red-300 border border-red-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  neutral: 'bg-white/5 text-gray-300 border border-white/10',
}

function Kpi({
  icon,
  value,
  label,
  accent,
  accentTone = 'lime',
}: {
  icon: React.ReactNode
  value: string
  label: string
  accent?: boolean
  accentTone?: 'lime' | 'danger'
}) {
  const accentCls = accentTone === 'danger' ? 'text-red-500' : 'text-pictus-lime'
  return (
    <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
      <div className={accent ? accentCls : 'text-gray-400'}>{icon}</div>
      <div className="text-2xl font-bold text-pictus-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

function vehicleName(v: {
  nickname: string | null
  make: string | null
  model: string | null
  registration: string
}) {
  return v.nickname || [v.make, v.model].filter(Boolean).join(' ') || v.registration
}

function EventRow({ o, t }: { o: DashOccurrence; t: Tr }) {
  const badge = dueLabel(o, t)
  const actionable = o.status === 'ACTION_REQUIRED' || o.overdue
  return (
    <Link
      href={`/client/my-fleet/events/${o.recurringEvent.id}`}
      className="w-full text-left flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-pictus-white font-medium truncate">{o.recurringEvent.name}</p>
        <p className="text-sm text-gray-400 truncate">
          {vehicleName(o.vehicle)} · {o.vehicle.registration}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full ${
          badge.tone === 'red'
            ? 'bg-red-500 text-white text-sm font-semibold px-4 py-1.5'
            : `text-xs px-2.5 py-1 ${toneClass[badge.tone]}`
        }`}
      >
        {badge.text}
      </span>
      {actionable ? (
        <span className="shrink-0 bg-pictus-lime text-pictus-black text-sm font-semibold px-4 py-1.5 rounded-full">
          {t(`action.${o.recurringEvent.actionType}`)}
        </span>
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
      )}
    </Link>
  )
}

export default function CarCareDashboardView({
  data,
  reload,
}: {
  data: DashboardData
  reload?: () => void
}) {
  const t = useTranslations('CarCare')
  const { data: session } = useSession()
  const [showEvent, setShowEvent] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const { counts } = data
  const events = [...data.needsAttention, ...data.upcoming]
  const firstName = session?.user?.name?.split(' ')[0]
  const greeting = firstName ? t('dash.greeting', { name: firstName }) : t('dash.greetingNoName')
  const vehicleOptions: VehicleOption[] = data.vehicles.map((v) => ({
    id: v.id,
    label: vehicleName(v),
  }))
  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="hidden md:block">
              <h1 className="text-3xl font-light">{t('dash.title')}</h1>
              <p className="text-gray-400">{t('dash.subtitle')}</p>
            </div>
            <div className="md:hidden">
              <h1 className="text-3xl font-light">{greeting}</h1>
              <p className="text-gray-400">
                {t('dash.summaryLine', {
                  vehicles: data.vehicles.length,
                  actions: data.counts.needsAttention,
                })}
              </p>
            </div>
          </div>
          <CarCareNotificationBell />
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Kpi
            icon={<AlertTriangle className="w-5 h-5" />}
            value={String(counts.needsAttention)}
            label={t('dash.kpiAction')}
            accent={counts.needsAttention > 0}
            accentTone="danger"
          />
          <Kpi
            icon={<Calendar className="w-5 h-5" />}
            value={String(counts.upcoming30)}
            label={t('dash.kpiUpcoming')}
          />
          <Kpi
            icon={<CalendarCheck className="w-5 h-5" />}
            value={String(counts.arranged)}
            label={t('dash.kpiArranged')}
          />
          <Link
            href="/client/my-fleet/costs"
            className="rounded-2xl hover:opacity-90 transition-opacity"
          >
            <Kpi
              icon={<Wallet className="w-5 h-5" />}
              value={`${counts.costThisYear.toFixed(0)} €`}
              label={t('dash.kpiCost')}
            />
          </Link>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">{t('dash.quickActions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.canModify !== false && (
              <button
                type="button"
                onClick={() => setShowEvent(true)}
                className="flex flex-col items-center gap-2 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors text-center"
              >
                <span className="text-pictus-lime">
                  <Plus className="w-5 h-5" />
                </span>
                <span className="text-sm text-pictus-white">{t('dash.qaAddEvent')}</span>
              </button>
            )}
            {data.canModify !== false && (
              <button
                type="button"
                onClick={() => setShowExpense(true)}
                className="flex flex-col items-center gap-2 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors text-center"
              >
                <span className="text-pictus-lime">
                  <Wallet className="w-5 h-5" />
                </span>
                <span className="text-sm text-pictus-white">{t('dash.qaLogCost')}</span>
              </button>
            )}
            <Link
              href="/client/my-fleet/garage"
              className="flex flex-col items-center gap-2 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors text-center"
            >
              <span className="text-pictus-lime">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-sm text-pictus-white">{t('dash.inviteMember')}</span>
            </Link>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">{t('dash.upcomingEvents')}</h2>
            <Link
              href="/client/my-fleet/events"
              className="text-sm text-pictus-lime hover:text-pictus-lime600"
            >
              {t('dash.viewAll')}
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
              {t('dash.allClear')}
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((o) => (
                <EventRow key={o.id} o={o} t={t} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">
              {t('dash.myVehicles')} ({data.vehicles.length})
            </h2>
            {data.canModify !== false && (
              <Link
                href="/client/my-fleet/vehicles/new"
                className="text-sm text-pictus-lime hover:text-pictus-lime600 inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {t('dash.addVehicle')}
              </Link>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.vehicles.map((v) => (
              <Link
                key={v.id}
                href={`/client/my-fleet/vehicles/${v.id}`}
                className="p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] flex items-center gap-3 hover:border-white/20 transition-colors"
              >
                {v.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.image}
                    alt={vehicleName(v)}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-pictus-lime/15 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 text-pictus-lime" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-pictus-white font-medium truncate">{vehicleName(v)}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {v.registration}
                    {v.year ? ` · ${v.year}` : ''}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {showEvent && (
          <AddEventModal
            vehicles={vehicleOptions}
            onClose={() => setShowEvent(false)}
            onSaved={() => reload?.()}
          />
        )}
        {showExpense && (
          <AddExpenseModal
            vehicles={vehicleOptions}
            onClose={() => setShowExpense(false)}
            onSaved={() => reload?.()}
          />
        )}
      </div>
    </div>
  )
}
