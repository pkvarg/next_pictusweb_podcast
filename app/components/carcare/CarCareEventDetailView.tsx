'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
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
    actualCost: number | null
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

const RECURRENCE_KEYS: Record<string, string> = {
  ONE_TIME: 'ev.recOneTime',
  FIXED_INTERVAL: 'ev.recFixedInterval',
  AFTER_COMPLETION: 'ev.recAfterCompletion',
  SEASONAL: 'ev.recSeasonal',
  MILEAGE: 'ev.recMileage',
  DATE_OR_MILEAGE: 'ev.recDateOrMileage',
}

const STAGE_UI: {
  stage: string
  labelKey: string
  hintKey: string
  lead?: boolean
  overdue?: boolean
}[] = [
  {
    stage: 'BOOKING',
    labelKey: 'ev.stageBookingLabel',
    hintKey: 'ev.stageBookingHint',
    lead: true,
  },
  {
    stage: 'APPOINTMENT',
    labelKey: 'ev.stageAppointmentLabel',
    hintKey: 'ev.stageAppointmentHint',
    lead: true,
  },
  {
    stage: 'DEADLINE',
    labelKey: 'ev.stageDeadlineLabel',
    hintKey: 'ev.stageDeadlineHint',
    lead: true,
  },
  {
    stage: 'OVERDUE',
    labelKey: 'ev.stageOverdueLabel',
    hintKey: 'ev.stageOverdueHint',
    overdue: true,
  },
  {
    stage: 'COMPLETION',
    labelKey: 'ev.stageCompletionLabel',
    hintKey: 'ev.stageCompletionHint',
  },
]

const CHANNELS: { key: Channel; labelKey: string; icon: React.ReactNode }[] = [
  { key: 'EMAIL', labelKey: 'ev.chEmail', icon: <Mail className="w-4 h-4" /> },
  { key: 'SMS', labelKey: 'ev.chSms', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'PUSH', labelKey: 'ev.chPush', icon: <Smartphone className="w-4 h-4" /> },
  { key: 'IN_APP', labelKey: 'ev.chInApp', icon: <AppWindow className="w-4 h-4" /> },
]

const input =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white focus:border-pictus-lime/50 focus:outline-none'
const label = 'block text-sm text-gray-400 mb-1.5'

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
  const t = useTranslations('CarCare')
  const locale = useLocale()
  const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(locale) : '—')
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
  const [notifActive, setNotifActive] = useState(data.rules.length > 0)
  const [previewChannel, setPreviewChannel] = useState<Channel>('EMAIL')

  const STAGE_DEFAULTS: Record<string, number> = { BOOKING: 14, APPOINTMENT: 1, DEADLINE: 3 }
  const DEFAULT_ACTIVE = new Set(['BOOKING', 'APPOINTMENT', 'DEADLINE'])
  const resetDefaults = () => {
    const init: Record<string, { active: boolean; leadDays: number }> = {}
    for (const s of STAGE_UI)
      init[s.stage] = {
        active: DEFAULT_ACTIVE.has(s.stage),
        leadDays: STAGE_DEFAULTS[s.stage] ?? 0,
      }
    setStages(init)
    setChannels(new Set<Channel>(['IN_APP', 'EMAIL']))
    setQuietOn(false)
    setRepeatOn(false)
    setNotifActive(true)
    setMsg(t('ev.defaultsRestored'))
  }
  const cancelNotif = () => {
    const init: Record<string, { active: boolean; leadDays: number }> = {}
    for (const s of STAGE_UI) {
      const r = ruleFor(s.stage)
      init[s.stage] = { active: !!r, leadDays: r?.leadDays ?? STAGE_DEFAULTS[s.stage] ?? 0 }
    }
    setStages(init)
    const set = new Set<Channel>()
    data.rules.forEach((r) => r.channels.forEach((c) => set.add(c)))
    if (set.size === 0) set.add('IN_APP')
    setChannels(set)
    setQuietOn(data.quietHours.start != null && data.quietHours.end != null)
    setRepeatOn(data.rules.some((r) => r.repeatUntilActioned))
    setNotifActive(data.rules.length > 0)
    setMsg(null)
  }

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
      setMsg(t('ev.saveFailed'))
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
      after(res, t('ev.saved'))
    } finally {
      setBusy(false)
    }
  }

  const saveNotif = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const chans = [...channels]
      const rules = notifActive
        ? STAGE_UI.filter((s) => stages[s.stage].active).map((s) => ({
            stage: s.stage,
            leadDays: s.lead ? stages[s.stage].leadDays : 0,
            channels: chans,
            repeatUntilActioned: repeatOn && (s.stage === 'OVERDUE' || s.stage === 'BOOKING'),
            repeatEveryDays: repeatOn ? Number(repeatDays) : null,
          }))
        : []
      const res = await fetch(`/api/carcare/events/${data.event.id}/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules,
          quietHoursStart: quietOn ? Number(quietStart) : null,
          quietHoursEnd: quietOn ? Number(quietEnd) : null,
        }),
      })
      after(res, t('ev.notifSaved'))
    } finally {
      setBusy(false)
    }
  }

  const book = async () => {
    if (!apptAt) {
      setMsg(t('ev.enterVisit'))
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
      after(res, t('ev.visitScheduled'))
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
      after(res, t('ev.markedDone'))
    } finally {
      setBusy(false)
    }
  }

  const statusBadge = () => {
    if (!data.current) return null
    if (data.current.overdue)
      return (
        <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
          {t('ev.stOverdue')}
        </span>
      )
    const map: Record<string, string> = {
      ARRANGED: 'ev.stArranged',
      ACTION_REQUIRED: 'ev.stActionRequired',
      UPCOMING: 'ev.stUpcoming',
    }
    const tone =
      data.current.status === 'ARRANGED'
        ? 'bg-pictus-lime/15 text-pictus-lime border-pictus-lime/30'
        : 'bg-white/5 text-gray-300 border-white/10'
    return (
      <span className={`text-xs px-2.5 py-1 rounded-full border ${tone}`}>
        {map[data.current.status] ? t(map[data.current.status]) : data.current.status}
      </span>
    )
  }

  const TABS = [
    { k: 'prehlad', label: t('ev.tabPrehlad'), icon: <Info className="w-4 h-4" /> },
    { k: 'termin', label: t('ev.tabTermin'), icon: <Repeat className="w-4 h-4" /> },
    { k: 'notif', label: t('ev.tabNotif'), icon: <Bell className="w-4 h-4" /> },
    { k: 'navsteva', label: t('ev.tabNavsteva'), icon: <CalendarPlus className="w-4 h-4" /> },
    { k: 'dokoncenie', label: t('ev.tabDokoncenie'), icon: <CheckCircle2 className="w-4 h-4" /> },
    { k: 'historia', label: t('ev.tabHistoria'), icon: <History className="w-4 h-4" /> },
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
            <Row label={t('ev.rowDue')} value={fmt(data.current?.dueDate ?? null)} />
            <Row
              label={t('ev.rowRecurrence')}
              value={
                (RECURRENCE_KEYS[data.event.recurrenceType]
                  ? t(RECURRENCE_KEYS[data.event.recurrenceType])
                  : data.event.recurrenceType) +
                (data.event.intervalMonths
                  ? ` · ${t('ev.monthsSuffix', { n: data.event.intervalMonths })}`
                  : '')
              }
            />
            <Row label={t('ev.rowResponsible')} value={data.event.responsibleUser?.name ?? '—'} />
            <Row
              label={t('ev.rowVisit')}
              value={
                data.current?.appointment
                  ? `${fmt(data.current.appointment.scheduledAt)}${data.current.appointment.provider ? ` · ${data.current.appointment.provider.name}` : ''}`
                  : '—'
              }
            />
            <Row
              label={t('ev.estimate')}
              value={data.event.expectedCost != null ? `${data.event.expectedCost} €` : '—'}
            />
            <Row
              label={t('ev.actual')}
              value={data.current?.actualCost != null ? `${data.current.actualCost} €` : '—'}
            />
            <Row
              label={t('ev.rowType')}
              value={data.event.kind === 'LEGAL' ? t('ev.typeLegal') : t('ev.typeRecommended')}
            />
          </div>
        )}

        {tab === 'termin' && (
          <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
            <div>
              <label className={label}>{t('ev.rowDue')}</label>
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
                <label className={label}>{t('ev.rowRecurrence')}</label>
                <select
                  className={input}
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  disabled={!canModify}
                >
                  {Object.entries(RECURRENCE_KEYS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {t(v)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>{t('ev.fieldIntervalMonths')}</label>
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
              <label className={label}>{t('ev.rowResponsible')}</label>
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
                <label className={label}>{t('ev.fieldPreferredProvider')}</label>
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
                <label className={label}>{t('ev.fieldExpectedCostEur')}</label>
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
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : t('common.save')}
              </button>
            )}
          </div>
        )}

        {tab === 'notif' && (
          <div className="space-y-5">
            <div className="grid lg:grid-cols-3 gap-5 items-start">
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-medium">{t('ev.notifTitle')}</h2>
                      <p className="text-sm text-gray-400">{t('ev.notifSub')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline text-xs text-gray-400">
                        {t('ev.masterToggle')}
                      </span>
                      <Toggle
                        on={notifActive}
                        disabled={!canModify}
                        onClick={() => setNotifActive((v) => !v)}
                      />
                    </div>
                  </div>
                  <div
                    className={`space-y-3 mt-4 ${notifActive ? '' : 'opacity-40 pointer-events-none'}`}
                  >
                    {STAGE_UI.map((s) => (
                      <div
                        key={s.stage}
                        className="flex items-center gap-3 py-2 border-b border-white/[0.06] last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-pictus-white text-sm font-medium inline-flex items-center gap-1.5">
                            {t(s.labelKey)}
                            <span title={t(s.hintKey)} className="text-gray-600">
                              <Info className="w-3.5 h-3.5" />
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">{t(s.hintKey)}</p>
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
                            <span className="text-xs text-gray-500">{t('ev.daysBefore')}</span>
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
                  <h2 className="font-medium mb-1">{t('ev.channelsTitle')}</h2>
                  <p className="text-sm text-gray-400 mb-4">{t('ev.channelsSub')}</p>
                  <div className={notifActive ? '' : 'opacity-40 pointer-events-none'}>
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
                            {c.icon} {t(c.labelKey)}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <Info className="w-3.5 h-3.5 shrink-0" /> {t('ev.verifiedContactsNote')}
                      </span>
                      <Link
                        href="/carcare/garage"
                        className="shrink-0 text-pictus-lime hover:text-pictus-lime600"
                      >
                        {t('ev.manageContacts')} →
                      </Link>
                    </div>
                  </div>
                </div>

                <div
                  className={`bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4 ${notifActive ? '' : 'opacity-40 pointer-events-none'}`}
                >
                  <h2 className="font-medium">{t('ev.advanced')}</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-pictus-white">{t('ev.quietHours')}</p>
                      <p className="text-xs text-gray-500">{t('ev.quietHoursHint')}</p>
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
                    <Toggle
                      on={quietOn}
                      disabled={!canModify}
                      onClick={() => setQuietOn((v) => !v)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-pictus-white">{t('ev.repeatReminder')}</p>
                      <p className="text-xs text-gray-500">{t('ev.repeatReminderHint')}</p>
                    </div>
                    {repeatOn && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-500">{t('ev.every')}</span>
                        <input
                          type="number"
                          min={1}
                          className="w-14 bg-pictus-black/40 border border-white/10 rounded-lg px-2 py-1"
                          value={repeatDays}
                          onChange={(e) => setRepeatDays(e.target.value)}
                          disabled={!canModify}
                        />
                        <span className="text-gray-500">{t('ev.days')}</span>
                      </div>
                    )}
                    <Toggle
                      on={repeatOn}
                      disabled={!canModify}
                      onClick={() => setRepeatOn((v) => !v)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5">
                  <h2 className="font-medium mb-3">{t('ev.summaryTitle')}</h2>
                  <Row label={t('ev.rowDue')} value={fmt(data.current?.dueDate ?? null)} />
                  <Row
                    label={t('ev.rowRecurrence')}
                    value={
                      RECURRENCE_KEYS[data.event.recurrenceType]
                        ? t(RECURRENCE_KEYS[data.event.recurrenceType])
                        : data.event.recurrenceType
                    }
                  />
                  <Row
                    label={t('ev.rowResponsible')}
                    value={data.event.responsibleUser?.name ?? '—'}
                  />
                  <Row
                    label={t('ev.sumActiveNotifs')}
                    value={t('ev.sumTypesCount', {
                      n: notifActive ? STAGE_UI.filter((s) => stages[s.stage].active).length : 0,
                    })}
                  />
                  <Row
                    label={t('ev.sumActiveChannels')}
                    value={
                      notifActive && channels.size
                        ? [...channels]
                            .map((c) => {
                              const def = CHANNELS.find((x) => x.key === c)
                              return def ? t(def.labelKey) : c
                            })
                            .join(', ')
                        : '—'
                    }
                  />
                </div>

                <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5">
                  <h2 className="font-medium mb-1">{t('ev.previewTitle')}</h2>
                  <p className="text-sm text-gray-400 mb-4">{t('ev.previewSub')}</p>
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {CHANNELS.map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setPreviewChannel(c.key)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${
                          previewChannel === c.key
                            ? 'bg-pictus-lime/15 text-pictus-lime border-pictus-lime/30'
                            : 'bg-white/5 text-gray-400 border-white/10'
                        }`}
                      >
                        {c.icon} {t(c.labelKey)}
                      </button>
                    ))}
                  </div>
                  {previewChannel === 'PUSH' || previewChannel === 'IN_APP' ? (
                    <div className="rounded-2xl bg-pictus-black/50 border border-white/10 p-3 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-pictus-lime/15 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4 text-pictus-lime" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-pictus-white">FleetSync</p>
                        <p className="text-sm text-pictus-white truncate">{data.event.name}</p>
                        <p className="text-xs text-gray-400">{t('ev.previewPushBody')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-pictus-black/50 border border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-pictus-lime/15 flex items-center justify-center">
                          <Bell className="w-3.5 h-3.5 text-pictus-lime" />
                        </div>
                        <span className="text-sm font-semibold text-pictus-white">FleetSync</span>
                      </div>
                      <p className="text-base font-medium text-pictus-white mb-2">
                        {t('ev.previewHeadline')}
                      </p>
                      <div className="text-xs text-gray-400 space-y-0.5 mb-3">
                        <p>
                          {t('ev.previewEventLabel')}: {data.event.name}
                        </p>
                        <p>
                          {t('ev.previewVehicleLabel')}: {vehName} · {data.vehicle.registration}
                        </p>
                        <p>
                          {t('ev.previewDueLabel')}: {fmt(data.current?.dueDate ?? null)}
                        </p>
                      </div>
                      <span className="inline-block bg-pictus-lime text-pictus-black text-xs font-semibold px-3 py-1.5 rounded-lg">
                        {t('ev.previewCta')}
                      </span>
                      <p className="text-[11px] text-gray-600 mt-3">{t('ev.previewAutomated')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {canModify && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={resetDefaults}
                  disabled={busy}
                  className="px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 disabled:opacity-50"
                >
                  {t('ev.resetDefaults')}
                </button>
                <div className="hidden sm:block flex-1" />
                <button
                  onClick={cancelNotif}
                  disabled={busy}
                  className="px-4 py-3 rounded-xl border border-white/10 text-pictus-white hover:bg-white/5 disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveNotif}
                  disabled={busy}
                  className="bg-pictus-lime text-pictus-black font-semibold px-6 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : t('ev.saveNotif')}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'navsteva' && (
          <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
            {data.current?.appointment && (
              <div className="rounded-xl bg-pictus-lime/10 border border-pictus-lime/30 p-3 text-sm text-pictus-lime">
                {t('ev.scheduledFor', { date: fmt(data.current.appointment.scheduledAt) })}
                {data.current.appointment.provider
                  ? ` · ${data.current.appointment.provider.name}`
                  : ''}
              </div>
            )}
            <div>
              <label className={label}>{t('ev.fieldVisitDateTime')}</label>
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
                <label className={label}>{t('ev.fieldProvider')}</label>
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
                <label className={label}>{t('ev.fieldEstCostEur')}</label>
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
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : t('ev.confirmBooking')}
              </button>
            )}
          </div>
        )}

        {tab === 'dokoncenie' && (
          <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>{t('ev.fieldDate')}</label>
                <input
                  type="date"
                  className={input}
                  value={doneDate}
                  onChange={(e) => setDoneDate(e.target.value)}
                  disabled={!canModify}
                />
              </div>
              <div>
                <label className={label}>{t('ev.fieldMileageState')}</label>
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
                <label className={label}>{t('ev.fieldPriceEur')}</label>
                <input
                  type="number"
                  className={input}
                  value={doneCost}
                  onChange={(e) => setDoneCost(e.target.value)}
                  disabled={!canModify}
                />
              </div>
              <div>
                <label className={label}>{t('ev.fieldNote')}</label>
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
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : t('ev.markDone')}
              </button>
            )}
          </div>
        )}

        {tab === 'historia' && (
          <div className="space-y-3">
            {data.history.length === 0 ? (
              <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
                {t('ev.historyEmpty')}
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
                        ? ` · ${h.completedMileage.toLocaleString(locale)} km`
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
