'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { Link } from '@/i18n/routing'
import {
  ArrowLeft,
  Info,
  Repeat,
  Bell,
  CalendarPlus,
  CheckCircle2,
  History,
  Loader2,
  Mail,
  MessageSquare,
  Smartphone,
  AppWindow,
} from 'lucide-react'

type Channel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'

export interface EventDetailData {
  canModify?: boolean
  event: {
    id: string
    name: string
    category: string
    kind: string
    actionType: string
    recurrenceType: string
    intervalMonths: number | null
    intervalDays: number | null
    intervalKm: number | null
    seasonalMonth: number | null
    seasonalDay: number | null
    expectedCost: number | null
    currency: string | null
    paused: boolean
    responsibleUserId: string | null
    preferredProviderId: string | null
    responsibleUser: { id: string; name: string } | null
  }
  vehicle: {
    id: string
    registration: string
    nickname: string | null
    make: string | null
    model: string | null
  }
  current: {
    id: string
    status: string
    dueDate: string | null
    dueMileage: number | null
    overdue: boolean
    appointment: { scheduledAt: string; provider: { id: string; name: string } | null } | null
  } | null
  history: {
    id: string
    completedAt: string | null
    completedMileage: number | null
    cost: number | null
    currency: string | null
    notes: string | null
  }[]
  rules: {
    stage: string
    leadDays: number
    channels: Channel[]
    repeatUntilActioned: boolean
    repeatEveryDays: number | null
  }[]
  members: { userId: string; name: string }[]
  providers: { id: string; name: string }[]
  quietHours: { start: number | null; end: number | null }
}

const RECURRENCE_LABEL: Record<string, string> = {
  ONE_TIME: 'Jednorazovo',
  FIXED_INTERVAL: 'Pevný interval',
  AFTER_COMPLETION: 'Po dokončení',
  SEASONAL: 'Sezónne',
  MILEAGE: 'Podľa km',
  DATE_OR_MILEAGE: 'Dátum alebo km',
}

const STAGE_UI: {
  stage: string
  label: string
  hint: string
  lead?: boolean
  overdue?: boolean
}[] = [
  {
    stage: 'BOOKING',
    label: 'Pripomenutie zabezpečenia návštevy',
    hint: 'Upozorní, aby ste si naplánovali termín.',
    lead: true,
  },
  {
    stage: 'APPOINTMENT',
    label: 'Pripomenutie plánovanej návštevy',
    hint: 'Upozorní na nadchádzajúci termín návštevy.',
    lead: true,
  },
  {
    stage: 'DEADLINE',
    label: 'Pripomenutie termínu povinnosti',
    hint: 'Upozorní na blížiaci sa konečný termín.',
    lead: true,
  },
  {
    stage: 'OVERDUE',
    label: 'Upozornenie na omeškanie',
    hint: 'Upozorní, ak je termín už po lehote.',
    overdue: true,
  },
  {
    stage: 'COMPLETION',
    label: 'Pripomenutie potvrdenia dokončenia',
    hint: 'Po návšteve sa spýta, či bola vykonaná.',
  },
]

const CHANNELS: { key: Channel; label: string; icon: React.ReactNode }[] = [
  { key: 'EMAIL', label: 'E-mail', icon: <Mail className="w-4 h-4" /> },
  { key: 'SMS', label: 'SMS', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'PUSH', label: 'Push', icon: <Smartphone className="w-4 h-4" /> },
  { key: 'IN_APP', label: 'V aplikácii', icon: <AppWindow className="w-4 h-4" /> },
]

const input =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white focus:border-pictus-lime/50 focus:outline-none'
const label = 'block text-sm text-gray-400 mb-1.5'
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('sk-SK') : '—')

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 w-11 h-6 rounded-full transition-colors relative ${on ? 'bg-pictus-lime' : 'bg-white/15'} disabled:opacity-50`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  )
}

export default function CarCareEventDetailView({
  data,
  reload,
}: {
  data: EventDetailData
  reload?: () => void
}) {
  const router = useRouter()
  const canModify = data.canModify !== false
  const [tab, setTab] = useState<
    'prehlad' | 'termin' | 'notif' | 'navsteva' | 'dokoncenie' | 'historia'
  >('prehlad')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const vehName =
    data.vehicle.nickname ||
    [data.vehicle.make, data.vehicle.model].filter(Boolean).join(' ') ||
    data.vehicle.registration

  // Termín tab state
  const [recurrenceType, setRecurrenceType] = useState(data.event.recurrenceType)
  const [intervalMonths, setIntervalMonths] = useState(data.event.intervalMonths?.toString() ?? '')
  const [dueDate, setDueDate] = useState(
    data.current?.dueDate ? data.current.dueDate.slice(0, 10) : '',
  )
  const [responsibleUserId, setResponsibleUserId] = useState(data.event.responsibleUserId ?? '')
  const [preferredProviderId, setPreferredProviderId] = useState(
    data.event.preferredProviderId ?? '',
  )
  const [expectedCost, setExpectedCost] = useState(data.event.expectedCost?.toString() ?? '')

  // Notifikácie tab state
  const ruleFor = (stage: string) => data.rules.find((r) => r.stage === stage)
  const [stages, setStages] = useState<Record<string, { active: boolean; leadDays: number }>>(
    () => {
      const init: Record<string, { active: boolean; leadDays: number }> = {}
      for (const s of STAGE_UI) {
        const r = ruleFor(s.stage)
        const defaults: Record<string, number> = { BOOKING: 14, APPOINTMENT: 1, DEADLINE: 3 }
        init[s.stage] = { active: !!r, leadDays: r?.leadDays ?? defaults[s.stage] ?? 0 }
      }
      return init
    },
  )
  const [channels, setChannels] = useState<Set<Channel>>(() => {
    const set = new Set<Channel>()
    data.rules.forEach((r) => r.channels.forEach((c) => set.add(c)))
    if (set.size === 0) set.add('IN_APP')
    return set
  })
  const [quietOn, setQuietOn] = useState(
    data.quietHours.start != null && data.quietHours.end != null,
  )
  const [quietStart, setQuietStart] = useState((data.quietHours.start ?? 22).toString())
  const [quietEnd, setQuietEnd] = useState((data.quietHours.end ?? 8).toString())
  const [repeatOn, setRepeatOn] = useState(data.rules.some((r) => r.repeatUntilActioned))
  const [repeatDays, setRepeatDays] = useState(
    (data.rules.find((r) => r.repeatEveryDays)?.repeatEveryDays ?? 3).toString(),
  )

  // Návšteva / Dokončenie
  const [apptAt, setApptAt] = useState('')
  const [apptProvider, setApptProvider] = useState(data.event.preferredProviderId ?? '')
  const [apptCost, setApptCost] = useState('')
  const [doneDate, setDoneDate] = useState(new Date().toISOString().slice(0, 10))
  const [doneMileage, setDoneMileage] = useState('')
  const [doneCost, setDoneCost] = useState('')
  const [doneNotes, setDoneNotes] = useState('')

  const after = (res: Response, okMsg: string) => {
    if (res.ok) {
      setMsg(okMsg)
      reload?.()
    } else {
      setMsg('Uloženie zlyhalo.')
    }
  }

  const saveTermin = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/carcare/events/${data.event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recurrenceType,
          intervalMonths: intervalMonths ? Number(intervalMonths) : null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          responsibleUserId: responsibleUserId || null,
          preferredProviderId: preferredProviderId || null,
          expectedCost: expectedCost ? Number(expectedCost) : null,
        }),
      })
      after(res, 'Uložené.')
    } finally {
      setBusy(false)
    }
  }

  const saveNotif = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const chans = [...channels]
      const rules = STAGE_UI.filter((s) => stages[s.stage].active).map((s) => ({
        stage: s.stage,
        leadDays: s.lead ? stages[s.stage].leadDays : 0,
        channels: chans,
        repeatUntilActioned: repeatOn && (s.stage === 'OVERDUE' || s.stage === 'BOOKING'),
        repeatEveryDays: repeatOn ? Number(repeatDays) : null,
      }))
      const res = await fetch(`/api/carcare/events/${data.event.id}/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules,
          quietHoursStart: quietOn ? Number(quietStart) : null,
          quietHoursEnd: quietOn ? Number(quietEnd) : null,
        }),
      })
      after(res, 'Notifikácie uložené.')
    } finally {
      setBusy(false)
    }
  }

  const book = async () => {
    if (!apptAt) {
      setMsg('Zadajte dátum a čas návštevy.')
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/carcare/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occurrenceId: data.current?.id,
          scheduledAt: new Date(apptAt).toISOString(),
          providerId: apptProvider || null,
          estimatedCost: apptCost ? Number(apptCost) : null,
        }),
      })
      after(res, 'Návšteva naplánovaná.')
    } finally {
      setBusy(false)
    }
  }

  const complete = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/carcare/occurrences/${data.current?.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: doneDate ? new Date(doneDate).toISOString() : undefined,
          mileage: doneMileage ? Number(doneMileage) : null,
          cost: doneCost ? Number(doneCost) : null,
          notes: doneNotes.trim() || null,
        }),
      })
      after(res, 'Označené ako hotové.')
    } finally {
      setBusy(false)
    }
  }

  const statusBadge = () => {
    if (!data.current) return null
    if (data.current.overdue)
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
          Po termíne
        </span>
      )
    const map: Record<string, string> = {
      ARRANGED: 'Naplánované',
      ACTION_REQUIRED: 'Vyžaduje akciu',
      UPCOMING: 'Nadchádzajúce',
    }
    const tone =
      data.current.status === 'ARRANGED'
        ? 'bg-pictus-lime/15 text-pictus-lime border-pictus-lime/30'
        : 'bg-white/5 text-gray-300 border-white/10'
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full border ${tone}`}>
        {map[data.current.status] ?? data.current.status}
      </span>
    )
  }

  const TABS = [
    { k: 'prehlad', label: 'Prehľad', icon: <Info className="w-4 h-4" /> },
    { k: 'termin', label: 'Termín a opakovanie', icon: <Repeat className="w-4 h-4" /> },
    { k: 'notif', label: 'Notifikácie', icon: <Bell className="w-4 h-4" /> },
    { k: 'navsteva', label: 'Návšteva', icon: <CalendarPlus className="w-4 h-4" /> },
    { k: 'dokoncenie', label: 'Dokončenie', icon: <CheckCircle2 className="w-4 h-4" /> },
    { k: 'historia', label: 'História', icon: <History className="w-4 h-4" /> },
  ] as const

  const Row = ({ label: l, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
      <span className="text-sm text-gray-400">{l}</span>
      <span className="text-sm text-pictus-white text-right">{value}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link
          href={`/carcare/vehicles/${data.vehicle.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-pictus-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {vehName}
        </Link>

        <header className="mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-light">{data.event.name}</h1>
            {statusBadge()}
          </div>
          <p className="text-gray-400 mt-1">
            {vehName} · {data.vehicle.registration}
          </p>
        </header>

        <div className="flex gap-1 overflow-x-auto mb-6 border-b border-white/[0.06]">
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => {
                setTab(t.k)
                setMsg(null)
              }}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 -mb-px ${
                tab === t.k
                  ? 'border-pictus-lime text-pictus-white'
                  : 'border-transparent text-gray-400 hover:text-pictus-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {msg && <p className="mb-4 text-sm text-pictus-lime">{msg}</p>}

        {tab === 'prehlad' && (
          <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5">
            <Row label="Termín povinnosti" value={fmt(data.current?.dueDate ?? null)} />
            <Row
              label="Opakovanie"
              value={
                RECURRENCE_LABEL[data.event.recurrenceType] +
                (data.event.intervalMonths ? ` · ${data.event.intervalMonths} mes.` : '')
              }
            />
            <Row label="Zodpovedná osoba" value={data.event.responsibleUser?.name ?? '—'} />
            <Row
              label="Návšteva"
              value={
                data.current?.appointment
                  ? `${fmt(data.current.appointment.scheduledAt)}${data.current.appointment.provider ? ` · ${data.current.appointment.provider.name}` : ''}`
                  : '—'
              }
            />
            <Row
              label="Očakávané náklady"
              value={data.event.expectedCost != null ? `${data.event.expectedCost} €` : '—'}
            />
            <Row
              label="Typ"
              value={data.event.kind === 'LEGAL' ? 'Zákonná povinnosť' : 'Odporúčané'}
            />
          </div>
        )}

        {tab === 'termin' && (
          <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
            <div>
              <label className={label}>Termín povinnosti</label>
              <input
                type="date"
                className={input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={!canModify}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Opakovanie</label>
                <select
                  className={input}
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  disabled={!canModify}
                >
                  {Object.entries(RECURRENCE_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Interval (mesiace)</label>
                <input
                  type="number"
                  className={input}
                  value={intervalMonths}
                  onChange={(e) => setIntervalMonths(e.target.value)}
                  disabled={!canModify}
                />
              </div>
            </div>
            <div>
              <label className={label}>Zodpovedná osoba</label>
              <select
                className={input}
                value={responsibleUserId}
                onChange={(e) => setResponsibleUserId(e.target.value)}
                disabled={!canModify}
              >
                <option value="">—</option>
                {data.members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Preferovaný poskytovateľ</label>
                <select
                  className={input}
                  value={preferredProviderId}
                  onChange={(e) => setPreferredProviderId(e.target.value)}
                  disabled={!canModify}
                >
                  <option value="">—</option>
                  {data.providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Očakávané náklady (€)</label>
                <input
                  type="number"
                  className={input}
                  value={expectedCost}
                  onChange={(e) => setExpectedCost(e.target.value)}
                  disabled={!canModify}
                />
              </div>
            </div>
            {canModify && (
              <button
                onClick={saveTermin}
                disabled={busy}
                className="w-full bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Uložiť'}
              </button>
            )}
          </div>
        )}

        {tab === 'notif' && (
          <div className="space-y-5">
            <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5">
              <h2 className="font-medium mb-1">Notifikácie pre túto udalosť</h2>
              <p className="text-sm text-gray-400 mb-4">
                Nastavte, kedy a ako vám máme pripomínať túto povinnosť.
              </p>
              <div className="space-y-3">
                {STAGE_UI.map((s) => (
                  <div
                    key={s.stage}
                    className="flex items-center gap-3 py-2 border-b border-white/[0.06] last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-pictus-white text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.hint}</p>
                    </div>
                    {s.lead && stages[s.stage].active && (
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          className="w-16 bg-pictus-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-pictus-white"
                          value={stages[s.stage].leadDays}
                          onChange={(e) =>
                            setStages((p) => ({
                              ...p,
                              [s.stage]: { ...p[s.stage], leadDays: Number(e.target.value) },
                            }))
                          }
                          disabled={!canModify}
                        />
                        <span className="text-xs text-gray-500">dní vopred</span>
                      </div>
                    )}
                    <Toggle
                      on={stages[s.stage].active}
                      disabled={!canModify}
                      onClick={() =>
                        setStages((p) => ({
                          ...p,
                          [s.stage]: { ...p[s.stage], active: !p[s.stage].active },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5">
              <h2 className="font-medium mb-1">Kanály doručenia</h2>
              <p className="text-sm text-gray-400 mb-4">
                Cez ktoré kanály chcete dostávať upozornenia.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHANNELS.map((c) => {
                  const on = channels.has(c.key)
                  return (
                    <button
                      key={c.key}
                      disabled={!canModify}
                      onClick={() =>
                        setChannels((prev) => {
                          const n = new Set(prev)
                          if (n.has(c.key)) n.delete(c.key)
                          else n.add(c.key)
                          return n
                        })
                      }
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm ${
                        on
                          ? 'bg-pictus-lime/15 text-pictus-lime border-pictus-lime/30'
                          : 'bg-white/5 text-gray-300 border-white/10'
                      } disabled:opacity-50`}
                    >
                      {c.icon} {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
              <h2 className="font-medium">Pokročilé nastavenia</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-pictus-white">Tiché hodiny</p>
                  <p className="text-xs text-gray-500">
                    Počas nich neposielame notifikácie (platí pre celý účet).
                  </p>
                </div>
                {quietOn && (
                  <div className="flex items-center gap-1 text-sm">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      className="w-14 bg-pictus-black/40 border border-white/10 rounded-lg px-2 py-1"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      disabled={!canModify}
                    />
                    <span className="text-gray-500">–</span>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      className="w-14 bg-pictus-black/40 border border-white/10 rounded-lg px-2 py-1"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      disabled={!canModify}
                    />
                  </div>
                )}
                <Toggle on={quietOn} disabled={!canModify} onClick={() => setQuietOn((v) => !v)} />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-pictus-white">Opakovať pripomenutie</p>
                  <p className="text-xs text-gray-500">Kým povinnosť nie je vybavená.</p>
                </div>
                {repeatOn && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-500">každé</span>
                    <input
                      type="number"
                      min={1}
                      className="w-14 bg-pictus-black/40 border border-white/10 rounded-lg px-2 py-1"
                      value={repeatDays}
                      onChange={(e) => setRepeatDays(e.target.value)}
                      disabled={!canModify}
                    />
                    <span className="text-gray-500">dní</span>
                  </div>
                )}
                <Toggle
                  on={repeatOn}
                  disabled={!canModify}
                  onClick={() => setRepeatOn((v) => !v)}
                />
              </div>
            </div>

            {canModify && (
              <button
                onClick={saveNotif}
                disabled={busy}
                className="w-full bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Uložiť notifikácie'}
              </button>
            )}
          </div>
        )}

        {tab === 'navsteva' && (
          <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
            {data.current?.appointment && (
              <div className="rounded-xl bg-pictus-lime/10 border border-pictus-lime/30 p-3 text-sm text-pictus-lime">
                Naplánované na {fmt(data.current.appointment.scheduledAt)}
                {data.current.appointment.provider
                  ? ` · ${data.current.appointment.provider.name}`
                  : ''}
              </div>
            )}
            <div>
              <label className={label}>Dátum a čas návštevy</label>
              <input
                type="datetime-local"
                className={input}
                value={apptAt}
                onChange={(e) => setApptAt(e.target.value)}
                disabled={!canModify}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Poskytovateľ</label>
                <select
                  className={input}
                  value={apptProvider}
                  onChange={(e) => setApptProvider(e.target.value)}
                  disabled={!canModify}
                >
                  <option value="">—</option>
                  {data.providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>Odhad. cena (€)</label>
                <input
                  type="number"
                  className={input}
                  value={apptCost}
                  onChange={(e) => setApptCost(e.target.value)}
                  disabled={!canModify}
                />
              </div>
            </div>
            {canModify && (
              <button
                onClick={book}
                disabled={busy || !data.current}
                className="w-full bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Potvrdiť objednávku'}
              </button>
            )}
          </div>
        )}

        {tab === 'dokoncenie' && (
          <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Dátum</label>
                <input
                  type="date"
                  className={input}
                  value={doneDate}
                  onChange={(e) => setDoneDate(e.target.value)}
                  disabled={!canModify}
                />
              </div>
              <div>
                <label className={label}>Stav km</label>
                <input
                  type="number"
                  className={input}
                  value={doneMileage}
                  onChange={(e) => setDoneMileage(e.target.value)}
                  disabled={!canModify}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Cena (€)</label>
                <input
                  type="number"
                  className={input}
                  value={doneCost}
                  onChange={(e) => setDoneCost(e.target.value)}
                  disabled={!canModify}
                />
              </div>
              <div>
                <label className={label}>Poznámka</label>
                <input
                  className={input}
                  value={doneNotes}
                  onChange={(e) => setDoneNotes(e.target.value)}
                  disabled={!canModify}
                />
              </div>
            </div>
            {canModify && (
              <button
                onClick={complete}
                disabled={busy || !data.current}
                className="w-full bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Označiť ako hotové'}
              </button>
            )}
          </div>
        )}

        {tab === 'historia' && (
          <div className="space-y-3">
            {data.history.length === 0 ? (
              <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
                Zatiaľ žiadna história.
              </div>
            ) : (
              data.history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
                >
                  <History className="w-5 h-5 text-gray-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-pictus-white text-sm">
                      {fmt(h.completedAt)}
                      {h.completedMileage
                        ? ` · ${h.completedMileage.toLocaleString('sk-SK')} km`
                        : ''}
                    </p>
                    {h.notes && <p className="text-xs text-gray-500 truncate">{h.notes}</p>}
                  </div>
                  {h.cost != null && h.cost > 0 && (
                    <span className="text-sm text-gray-300 shrink-0">
                      {h.cost} {h.currency ?? '€'}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
