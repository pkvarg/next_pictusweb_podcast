import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  Wallet,
  Car,
  ChevronRight,
  Plus,
} from 'lucide-react'

export interface DashOccurrence {
  id: string
  status: string
  dueDate: string | null
  overdue?: boolean
  recurringEvent: { name: string; category: string; kind: string; actionType: string }
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
}

export interface DashboardData {
  counts: { needsAttention: number; upcoming30: number; arranged: number; costThisYear: number }
  needsAttention: DashOccurrence[]
  upcoming: DashOccurrence[]
  vehicles: DashVehicle[]
}

const ACTION_LABEL: Record<string, string> = {
  BOOK: 'Objednať',
  RENEW: 'Obnoviť',
  PAY: 'Zaplatiť',
  PURCHASE: 'Kúpiť',
  INSPECT: 'Objednať',
  CUSTOM: 'Zobraziť',
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
}

function dueLabel(o: DashOccurrence): { text: string; tone: 'red' | 'amber' | 'neutral' } {
  const d = daysUntil(o.dueDate)
  if (o.overdue) return { text: d != null ? `Po termíne (${d} dní)` : 'Po termíne', tone: 'red' }
  if (o.status === 'ARRANGED') return { text: 'Naplánované', tone: 'neutral' }
  if (o.status === 'ACTION_REQUIRED') return { text: 'Vyžaduje akciu', tone: 'amber' }
  if (d != null) return { text: `Za ${d} dní`, tone: 'neutral' }
  return { text: 'Nadchádzajúce', tone: 'neutral' }
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
}: {
  icon: React.ReactNode
  value: string
  label: string
  accent?: boolean
}) {
  return (
    <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
      <div className={accent ? 'text-pictus-lime' : 'text-gray-400'}>{icon}</div>
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

function EventRow({ o }: { o: DashOccurrence }) {
  const badge = dueLabel(o)
  const actionable = o.status === 'ACTION_REQUIRED' || o.overdue
  return (
    <div className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]">
      <div className="min-w-0 flex-1">
        <p className="text-pictus-white font-medium truncate">{o.recurringEvent.name}</p>
        <p className="text-sm text-gray-400 truncate">
          {vehicleName(o.vehicle)} · {o.vehicle.registration}
        </p>
      </div>
      <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${toneClass[badge.tone]}`}>
        {badge.text}
      </span>
      {actionable ? (
        <button className="shrink-0 bg-pictus-lime text-pictus-black text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-pictus-lime600 transition-colors">
          {ACTION_LABEL[o.recurringEvent.actionType] ?? 'Zobraziť'}
        </button>
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
      )}
    </div>
  )
}

export default function CarCareDashboardView({ data }: { data: DashboardData }) {
  const { counts } = data
  const events = [...data.needsAttention, ...data.upcoming]
  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-light">Domov</h1>
          <p className="text-gray-400">Prehľad vašej garáže</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Kpi
            icon={<AlertTriangle className="w-5 h-5" />}
            value={String(counts.needsAttention)}
            label="Vyžaduje akciu"
            accent={counts.needsAttention > 0}
          />
          <Kpi
            icon={<Calendar className="w-5 h-5" />}
            value={String(counts.upcoming30)}
            label="Najbližšie (30 dní)"
          />
          <Kpi
            icon={<CalendarCheck className="w-5 h-5" />}
            value={String(counts.arranged)}
            label="Naplánovaná návšteva"
          />
          <Kpi
            icon={<Wallet className="w-5 h-5" />}
            value={`${counts.costThisYear.toFixed(0)} €`}
            label="Náklady tento rok"
          />
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Najbližšie udalosti</h2>
            <a href="events" className="text-sm text-pictus-lime hover:text-pictus-lime600">
              Zobraziť všetky
            </a>
          </div>
          {events.length === 0 ? (
            <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
              Všetko je v poriadku — nič nevyžaduje vašu pozornosť.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((o) => (
                <EventRow key={o.id} o={o} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Moje vozidlá ({data.vehicles.length})</h2>
            <a
              href="garage"
              className="text-sm text-pictus-lime hover:text-pictus-lime600 inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Pridať vozidlo
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.vehicles.map((v) => (
              <div
                key={v.id}
                className="p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-pictus-lime/15 flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-pictus-lime" />
                </div>
                <div className="min-w-0">
                  <p className="text-pictus-white font-medium truncate">{vehicleName(v)}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {v.registration}
                    {v.year ? ` · ${v.year}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* bottom nav (mobile-first) */}
      <nav className="fixed bottom-0 inset-x-0 bg-pictus-onyx900/95 backdrop-blur border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl grid grid-cols-5 text-center text-[11px]">
          {[
            { k: 'Domov', i: <Car className="w-5 h-5" /> },
            { k: 'Vozidlá', i: <Car className="w-5 h-5" /> },
            { k: 'Udalosti', i: <Calendar className="w-5 h-5" /> },
            { k: 'Náklady', i: <Wallet className="w-5 h-5" /> },
            { k: 'Viac', i: <ChevronRight className="w-5 h-5" /> },
          ].map((t, idx) => (
            <div
              key={t.k}
              className={`py-2.5 flex flex-col items-center gap-0.5 ${idx === 0 ? 'text-pictus-lime' : 'text-gray-400'}`}
            >
              {t.i}
              <span>{t.k}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}
