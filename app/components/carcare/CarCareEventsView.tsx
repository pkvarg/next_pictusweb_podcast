'use client'

import { useMemo, useState } from 'react'
import { Calendar, List, ChevronRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'

type Tr = (key: string, values?: Record<string, string | number>) => string

export interface EvOccurrence {
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

const toneClass = {
  red: 'bg-red-500/15 text-red-300 border border-red-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  neutral: 'bg-white/5 text-gray-300 border border-white/10',
  lime: 'bg-pictus-lime/15 text-pictus-lime border border-pictus-lime/30',
}

function daysUntil(iso: string | null) {
  return iso == null ? null : Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
}
function vehicleName(v: EvOccurrence['vehicle']) {
  return v.nickname || [v.make, v.model].filter(Boolean).join(' ') || v.registration
}
function dueBadge(o: EvOccurrence, t: Tr): { text: string; tone: keyof typeof toneClass } {
  const d = daysUntil(o.dueDate)
  if (o.overdue)
    return { text: d != null ? t('badge.overdueDays', { d }) : t('badge.overdue'), tone: 'red' }
  if (o.status === 'ARRANGED') return { text: t('badge.arranged'), tone: 'lime' }
  if (o.status === 'ACTION_REQUIRED') return { text: t('badge.actionReq'), tone: 'amber' }
  if (d != null) return { text: t('badge.inDays', { d }), tone: 'neutral' }
  return { text: t('badge.upcoming'), tone: 'neutral' }
}

const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function EventList({ occurrences, t }: { occurrences: EvOccurrence[]; t: Tr }) {
  if (occurrences.length === 0) {
    return (
      <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
        {t('events.empty')}
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {occurrences.map((o) => {
        const badge = dueBadge(o, t)
        return (
          <Link
            key={o.id}
            href={`/carcare/events/${o.recurringEvent.id}`}
            className="w-full text-left flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-pictus-white font-medium truncate">{o.recurringEvent.name}</p>
              <p className="text-sm text-gray-400 truncate">
                {vehicleName(o.vehicle)} · {o.vehicle.registration}
              </p>
            </div>
            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${toneClass[badge.tone]}`}>
              {badge.text}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
          </Link>
        )
      })}
    </div>
  )
}

function MonthCalendar({ occurrences, t }: { occurrences: EvOccurrence[]; t: Tr }) {
  const locale = useLocale()
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const dow = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i)))
  }, [locale])
  const { weeks, dueByDay, apptByDay } = useMemo<{
    weeks: Date[][]
    dueByDay: Set<string>
    apptByDay: Set<string>
  }>(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7 // Monday-first
    const gridStart = new Date(year, month, 1 - startOffset)
    const weeks: Date[][] = []
    for (let w = 0; w < 6; w++) {
      const row: Date[] = []
      for (let d = 0; d < 7; d++)
        row.push(
          new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + w * 7 + d),
        )
      weeks.push(row)
    }
    const dueByDay = new Set<string>()
    const apptByDay = new Set<string>()
    for (const o of occurrences) {
      if (o.dueDate) dueByDay.add(ymd(new Date(o.dueDate)))
      const a = o.appointments?.[0]
      if (a) apptByDay.add(ymd(new Date(a.scheduledAt)))
    }
    return { weeks, dueByDay, apptByDay }
  }, [cursor, occurrences])

  const month = cursor.getMonth()
  const selectedDate = selectedDay
    ? (() => {
        const [y, m, d] = selectedDay.split('-').map(Number)
        return new Date(y, m, d)
      })()
    : null
  const selectedOccurrences = selectedDay
    ? occurrences.filter((o) => {
        const byDue = o.dueDate != null && ymd(new Date(o.dueDate)) === selectedDay
        const appt = o.appointments?.[0]
        const byAppt = appt != null && ymd(new Date(appt.scheduledAt)) === selectedDay
        return byDue || byAppt
      })
    : []
  return (
    <div className="space-y-4">
      <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="px-3 py-1 rounded-lg hover:bg-white/10 text-gray-300"
          >
            ‹
          </button>
          <div className="font-medium text-pictus-white capitalize">
            {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(cursor)}
          </div>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="px-3 py-1 rounded-lg hover:bg-white/10 text-gray-300"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
          {dow.map((d, i) => (
            <div key={i} className="capitalize">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((day) => {
            const key = ymd(day)
            const inMonth = day.getMonth() === month
            const isDue = dueByDay.has(key)
            const isAppt = apptByDay.has(key)
            const isToday = ymd(day) === ymd(new Date())
            const isSelected = key === selectedDay
            return (
              <div
                key={key}
                role="button"
                onClick={() => setSelectedDay((prev) => (prev === key ? null : key))}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer hover:bg-white/5 ${inMonth ? 'text-pictus-white' : 'text-gray-600'} ${isToday ? 'bg-white/10' : ''} ${isSelected ? 'ring-2 ring-pictus-lime' : ''}`}
              >
                <span>{day.getDate()}</span>
                <div className="flex gap-0.5 mt-0.5 h-1.5">
                  {isDue && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  {isAppt && <span className="w-1.5 h-1.5 rounded-full bg-pictus-lime" />}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> {t('events.legendDue')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pictus-lime" /> {t('events.legendVisit')}
          </span>
        </div>
      </div>
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="text-pictus-white font-medium capitalize">
            {new Intl.DateTimeFormat(locale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(selectedDate)}
          </h3>
          {selectedOccurrences.length === 0 ? (
            <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
              {t('events.dayNoEvents')}
            </div>
          ) : (
            selectedOccurrences.map((o) => {
              const appt = o.appointments?.[0]
              const isVisit = appt != null && ymd(new Date(appt.scheduledAt)) === selectedDay
              return (
                <Link
                  key={o.id}
                  href={`/carcare/events/${o.recurringEvent.id}`}
                  className="w-full text-left flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors"
                >
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full ${isVisit ? 'bg-pictus-lime' : 'bg-amber-400'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-pictus-white font-medium truncate">
                      {o.recurringEvent.name}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {vehicleName(o.vehicle)} · {o.vehicle.registration}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function CarCareEventsView({ occurrences }: { occurrences: EvOccurrence[] }) {
  const t = useTranslations('CarCare')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-light">{t('events.title')}</h1>
            <p className="text-gray-400">{t('events.subtitle')}</p>
          </div>
          <div className="flex items-center gap-1 bg-pictus-onyx900 rounded-full p-1 border border-white/[0.06]">
            <button
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${view === 'list' ? 'bg-pictus-lime text-pictus-black font-semibold' : 'text-gray-300'}`}
            >
              <List className="w-4 h-4" /> {t('events.list')}
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${view === 'calendar' ? 'bg-pictus-lime text-pictus-black font-semibold' : 'text-gray-300'}`}
            >
              <Calendar className="w-4 h-4" /> {t('events.calendar')}
            </button>
          </div>
        </header>
        {view === 'list' ? (
          <EventList occurrences={occurrences} t={t} />
        ) : (
          <MonthCalendar occurrences={occurrences} t={t} />
        )}
      </div>
    </div>
  )
}
