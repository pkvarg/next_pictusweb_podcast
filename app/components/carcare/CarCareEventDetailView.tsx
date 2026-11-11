'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import InfoTip from './InfoTip'
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
  User as UserIcon,
  Check,
  X,
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
    tyreSize: string | null
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
    notes: string | null
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
  defaultRules: {
    stage: string
    leadDays: number
    channels: Channel[]
    repeatUntilActioned: boolean
    repeatEveryDays: number | null
  }[]
  members: { userId: string; name: string }[]
  providers: { id: string; name: string }[]
  recipientIds: string[]
  excludedRecipientIds: string[]
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
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white focus:border-pictus-lime/50 focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer'
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
  const vehLine =
    vehName === data.vehicle.registration ? vehName : `${vehName} · ${data.vehicle.registration}`

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
  const isTyres = data.event.category === 'tyres'
  const [tyreSize, setTyreSize] = useState(data.event.tyreSize ?? '')
  const [notes, setNotes] = useState(data.current?.notes ?? '')

  // Notifikácie tab state. When the event has no own rules, pre-fill from the org-wide
  // central defaults (inherited) so the tab reflects what will actually fire.
  const STAGE_DEFAULTS: Record<string, number> = { BOOKING: 14, APPOINTMENT: 1, DEADLINE: 3 }
  const effectiveRules = data.rules.length > 0 ? data.rules : data.defaultRules
  const inherited = data.rules.length === 0 && data.defaultRules.length > 0
  const ruleFor = (stage: string) => effectiveRules.find((r) => r.stage === stage)
  const stagesFrom = (src: EventDetailData['rules']) => {
    const init: Record<string, { active: boolean; leadDays: number }> = {}
    for (const s of STAGE_UI) {
      const r = src.find((x) => x.stage === s.stage)
      init[s.stage] = { active: !!r, leadDays: r?.leadDays ?? STAGE_DEFAULTS[s.stage] ?? 0 }
    }
    return init
  }
  const channelsFrom = (src: EventDetailData['rules']) => {
    const set = new Set<Channel>()
    src.forEach((r) => r.channels.forEach((c) => set.add(c)))
    if (set.size === 0) set.add('IN_APP')
    return set
  }
  const [stages, setStages] = useState<Record<string, { active: boolean; leadDays: number }>>(() =>
    stagesFrom(effectiveRules),
  )
  const [channels, setChannels] = useState<Set<Channel>>(() => channelsFrom(effectiveRules))
  const [repeatOn, setRepeatOn] = useState(effectiveRules.some((r) => r.repeatUntilActioned))
  const [repeatDays, setRepeatDays] = useState(
    (effectiveRules.find((r) => r.repeatEveryDays)?.repeatEveryDays ?? 3).toString(),
  )
  const [notifActive, setNotifActive] = useState(effectiveRules.length > 0)
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set(data.excludedRecipientIds))
  const recipientPool = (() => {
    const ids = new Set<string>(data.recipientIds)
    if (data.event.responsibleUserId) ids.add(data.event.responsibleUserId)
    return [...ids].map((id) => ({
      userId: id,
      name: data.members.find((m) => m.userId === id)?.name ?? id,
    }))
  })()

  const DEFAULT_ACTIVE = new Set(['BOOKING', 'APPOINTMENT', 'DEADLINE'])
  const resetDefaults = () => {
    if (data.defaultRules.length > 0) {
      setStages(stagesFrom(data.defaultRules))
      setChannels(channelsFrom(data.defaultRules))
      setRepeatOn(data.defaultRules.some((r) => r.repeatUntilActioned))
      setNotifActive(true)
    } else {
      const init: Record<string, { active: boolean; leadDays: number }> = {}
      for (const s of STAGE_UI)
        init[s.stage] = {
          active: DEFAULT_ACTIVE.has(s.stage),
          leadDays: STAGE_DEFAULTS[s.stage] ?? 0,
        }
      setStages(init)
      setChannels(new Set<Channel>(['IN_APP', 'EMAIL']))
      setRepeatOn(false)
      setNotifActive(true)
    }
    setMsg(t('ev.defaultsRestored'))
  }
  const cancelNotif = () => {
    setStages(stagesFrom(effectiveRules))
    setChannels(channelsFrom(effectiveRules))
    setRepeatOn(effectiveRules.some((r) => r.repeatUntilActioned))
    setNotifActive(effectiveRules.length > 0)
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
      // Return to the overview so the editing form doesn't linger after a save — the
      // tiny inline "Saved" over an unchanged form read as "did it save?".
      setTab('prehlad')
    } else {
      setMsg(t('ev.saveFailed'))
    }
  }

  // Number fields: select the current value on focus so typing replaces it, instead of the
  // typed digits piling up next to a leading 0 (e.g. "0" + "1" showing "01").
  const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.select()

  // When a save message appears, scroll the banner into view — on a long form (Notifikácie)
  // the user is usually at the bottom by the save button, so otherwise it flashes off-screen.
  const msgRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (msg) msgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [msg])

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
          ...(isTyres ? { tyreSize: tyreSize.trim() || null } : {}),
          notes: notes.trim() || null,
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
      // IN_APP is the always-on baseline channel (not shown as a toggle), so always include it.
      const chans = [...new Set<Channel>([...channels, 'IN_APP'])]
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
          excludedRecipientIds: [...excluded],
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
        : data.current.status === 'ACTION_REQUIRED'
          ? 'bg-red-500/15 text-red-300 border-red-500/30'
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
          href={`/client/my-fleet/vehicles/${data.vehicle.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-pictus-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {vehName}
        </Link>

        <header className="mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-light">{data.event.name}</h1>
            {statusBadge()}
          </div>
          <p className="text-gray-400 mt-1">{vehLine}</p>
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

        {msg && (
          <div
            ref={msgRef}
            className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
              msg === t('ev.saveFailed')
                ? 'bg-red-500/15 border border-red-500/30 text-red-200'
                : 'bg-pictus-lime/15 border border-pictus-lime/30 text-pictus-lime'
            }`}
          >
            {msg === t('ev.saveFailed') ? (
              <X className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            {msg}
          </div>
        )}

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
            {isTyres && <Row label={t('ev.fieldTyreSize')} value={data.event.tyreSize || '—'} />}
            {data.current?.notes && (
              <div className="pt-3 mt-1 border-t border-white/[0.06]">
                <p className="text-sm text-gray-400 mb-1">{t('ev.fieldNotes')}</p>
                <p className="text-sm text-pictus-white whitespace-pre-wrap">
                  {data.current.notes}
                </p>
              </div>
            )}
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
                  onFocus={selectOnFocus}
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
                  onFocus={selectOnFocus}
                  className={input}
                  value={expectedCost}
                  onChange={(e) => setExpectedCost(e.target.value)}
                  disabled={!canModify}
                />
              </div>
            </div>
            {isTyres && (
              <div>
                <label className={label}>
                  {t('ev.fieldTyreSize')}
                  <span className="ml-1 text-gray-500">({t('common.optional')})</span>
                </label>
                <input
                  className={input}
                  placeholder={t('ev.tyreSizePlaceholder')}
                  maxLength={40}
                  value={tyreSize}
                  onChange={(e) => setTyreSize(e.target.value)}
                  disabled={!canModify}
                />
              </div>
            )}
            <div>
              <label className={label}>
                {t('ev.fieldNotes')}
                <span className="ml-1 text-gray-500">({t('common.optional')})</span>
              </label>
              <textarea
                className={`${input} min-h-[80px] resize-y`}
                placeholder={t('ev.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!canModify}
              />
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
            <div className="space-y-5 max-w-3xl">
              {inherited && (
                <div className="flex items-start gap-2 rounded-2xl bg-pictus-lime/5 border border-pictus-lime/20 p-4 text-sm text-gray-300">
                  <Info className="w-4 h-4 text-pictus-lime shrink-0 mt-0.5" />
                  <p>
                    {t('ev.inheritedNote')}{' '}
                    <Link
                      href="/client/my-fleet/notifications"
                      className="text-pictus-lime hover:text-pictus-lime600"
                    >
                      {t('recipients.manageDefaults')}
                    </Link>
                  </p>
                </div>
              )}
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
                          <InfoTip text={t(s.hintKey)} />
                        </p>
                        <p className="text-xs text-gray-500">{t(s.hintKey)}</p>
                      </div>
                      {s.lead && stages[s.stage].active && (
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            onFocus={selectOnFocus}
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
                  <div className="grid grid-cols-3 gap-2">
                    {CHANNELS.filter((c) => c.key !== 'IN_APP').map((c) => {
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
                      href="/client/my-fleet/garage"
                      className="shrink-0 text-pictus-lime hover:text-pictus-lime600"
                    >
                      {t('ev.manageContacts')} →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5">
                <h2 className="font-medium mb-1">{t('recipients.title')}</h2>
                <p className="text-sm text-gray-400 mb-4">{t('recipients.eventSubtitle')}</p>
                {recipientPool.length === 0 ? (
                  <p className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                    <Info className="w-4 h-4 shrink-0" /> {t('recipients.empty')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recipientPool.map((m) => {
                      const on = !excluded.has(m.userId)
                      return (
                        <button
                          key={m.userId}
                          type="button"
                          disabled={!canModify}
                          onClick={() =>
                            setExcluded((prev) => {
                              const n = new Set(prev)
                              if (n.has(m.userId)) n.delete(m.userId)
                              else n.add(m.userId)
                              return n
                            })
                          }
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-sm ${
                            on
                              ? 'bg-pictus-lime/15 text-pictus-white border-pictus-lime/30'
                              : 'bg-white/5 text-gray-500 border-white/10'
                          } disabled:opacity-50`}
                        >
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <UserIcon className="w-4 h-4 shrink-0 text-gray-400" />
                            <span className="truncate">{m.name}</span>
                          </span>
                          {on && <Check className="w-4 h-4 text-pictus-lime shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
                <Link
                  href="/client/my-fleet/notifications"
                  className="mt-3 inline-block text-xs text-pictus-lime hover:text-pictus-lime600"
                >
                  {t('recipients.manageDefaults')} →
                </Link>
              </div>

              <div
                className={`bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4 ${notifActive ? '' : 'opacity-40 pointer-events-none'}`}
              >
                <h2 className="font-medium">{t('ev.advanced')}</h2>
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
                        onFocus={selectOnFocus}
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
                  onFocus={selectOnFocus}
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
                  onFocus={selectOnFocus}
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
                  onFocus={selectOnFocus}
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
