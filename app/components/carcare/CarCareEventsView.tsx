'use client'

import { useMemo, useState } from 'react'
import { Calendar, List, ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import CarCareBottomNav from './CarCareBottomNav'

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
function dueBadge(o: EvOccurrence): { text: string; tone: keyof typeof toneClass } {
  const d = daysUntil(o.dueDate)
  if (o.overdue) return { text: d != null ? `Po termíne (${d} dní)` : 'Po termíne', tone: 'red' }
  if (o.status === 'ARRANGED') return { text: 'Naplánované', tone: 'lime' }
  if (o.status === 'ACTION_REQUIRED') return { text: 'Vyžaduje akciu', tone: 'amber' }
  if (d != null) return { text: `Za ${d} dní`, tone: 'neutral' }
  return { text: 'Nadchádzajúce', tone: 'neutral' }
}

const DOW = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']
const MONTHS = [
  'Január',
  'Február',
  'Marec',
  'Apríl',
  'Máj',
  'Jún',
  'Júl',
  'August',
  'September',
  'Október',
  'November',
  'December',
]
const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

function EventList({ occurrences }: { occurrences: EvOccurrence[] }) {
  if (occurrences.length === 0) {
    return (
      <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
        Žiadne udalosti.
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {occurrences.map((o) => {
        const badge = dueBadge(o)
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

function MonthCalendar({ occurrences }: { occurrences: EvOccurrence[] }) {
  const [cursor, setCursor] = useState(() => new Date())
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
  return (
    <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="px-3 py-1 rounded-lg hover:bg-white/10 text-gray-300"
        >
          ‹
        </button>
        <div className="font-medium text-pictus-white">
          {MONTHS[month]} {cursor.getFullYear()}
        </div>
        <button
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="px-3 py-1 rounded-lg hover:bg-white/10 text-gray-300"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
        {DOW.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day) => {
          const key = ymd(day)
          const inMonth = day.getMonth() === month
          const isDue = dueByDay.has(key)
          const isAppt = apptByDay.has(key)
          const isToday = ymd(day) === ymd(new Date())
          return (
            <div
              key={key}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm ${inMonth ? 'text-pictus-white' : 'text-gray-600'} ${isToday ? 'bg-white/10' : ''}`}
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
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Termín povinnosti
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pictus-lime" /> Návšteva
        </span>
      </div>
    </div>
  )
}

export default function CarCareEventsView({ occurrences }: { occurrences: EvOccurrence[] }) {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-light">Udalosti</h1>
            <p className="text-gray-400">Termíny a návštevy vašich vozidiel</p>
          </div>
          <div className="flex items-center gap-1 bg-pictus-onyx900 rounded-full p-1 border border-white/[0.06]">
            <button
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${view === 'list' ? 'bg-pictus-lime text-pictus-black font-semibold' : 'text-gray-300'}`}
            >
              <List className="w-4 h-4" /> Zoznam
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${view === 'calendar' ? 'bg-pictus-lime text-pictus-black font-semibold' : 'text-gray-300'}`}
            >
              <Calendar className="w-4 h-4" /> Kalendár
            </button>
          </div>
        </header>
        {view === 'list' ? (
          <EventList occurrences={occurrences} />
        ) : (
          <MonthCalendar occurrences={occurrences} />
        )}
      </div>
      <CarCareBottomNav current="events" />
    </div>
  )
}
