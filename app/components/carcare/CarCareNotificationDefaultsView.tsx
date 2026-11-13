'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import InfoTip from './InfoTip'
import {
  Loader2,
  Info,
  Mail,
  MessageSquare,
  Smartphone,
  AppWindow,
  User as UserIcon,
  Check,
  BookOpen,
  Undo2,
  AlertTriangle,
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { Channel } from '@prisma/client'
import CarCarePushToggle from './CarCarePushToggle'

interface RuleData {
  stage: string
  leadDays: number
  channels: Channel[]
  repeatUntilActioned: boolean
  repeatEveryDays: number | null
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export interface DefaultsData {
  canModify: boolean
  rules: RuleData[]
  members: { userId: string; name: string }[]
  recipientIds: string[]
  sendTime: { hour: number; minute: number }
  locale: string
}

const LOCALE_OPTIONS: { value: string; label: string }[] = [
  { value: 'sk', label: 'Slovenčina' },
  { value: 'en', label: 'English' },
  { value: 'hu', label: 'Magyar' },
]

const STAGE_UI: { stage: string; labelKey: string; hintKey: string; lead?: boolean }[] = [
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
  { stage: 'OVERDUE', labelKey: 'ev.stageOverdueLabel', hintKey: 'ev.stageOverdueHint' },
  { stage: 'COMPLETION', labelKey: 'ev.stageCompletionLabel', hintKey: 'ev.stageCompletionHint' },
]

const CHANNELS: { key: Channel; labelKey: string; icon: React.ReactNode }[] = [
  { key: 'EMAIL', labelKey: 'ev.chEmail', icon: <Mail className="w-4 h-4" /> },
  { key: 'SMS', labelKey: 'ev.chSms', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'PUSH', labelKey: 'ev.chPush', icon: <Smartphone className="w-4 h-4" /> },
  { key: 'IN_APP', labelKey: 'ev.chInApp', icon: <AppWindow className="w-4 h-4" /> },
]

const STAGE_DEFAULTS: Record<string, number> = { BOOKING: 14, APPOINTMENT: 1, DEADLINE: 3 }

const DEFAULTS_URL = '/api/carcare/notifications/defaults'

type Snapshot = {
  stages: Record<string, { active: boolean; leadDays: number }>
  channels: Channel[]
  sendTime: string
  locale: string
  repeatOn: boolean
  repeatDays: string
  recipients: string[]
}

function Toggle({
  on,
  disabled,
  onClick,
}: {
  on: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        on ? 'bg-pictus-lime' : 'bg-white/15'
      } disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          on ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

export default function CarCareNotificationDefaultsView({ data }: { data: DefaultsData }) {
  const t = useTranslations('CarCare')
  const canModify = data.canModify
  const ruleFor = (stage: string) => data.rules.find((r) => r.stage === stage)

  const [stages, setStages] = useState<Record<string, { active: boolean; leadDays: number }>>(
    () => {
      const init: Record<string, { active: boolean; leadDays: number }> = {}
      for (const s of STAGE_UI) {
        const r = ruleFor(s.stage)
        init[s.stage] = { active: !!r, leadDays: r?.leadDays ?? STAGE_DEFAULTS[s.stage] ?? 0 }
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
  const [sendTime, setSendTime] = useState(
    `${pad2(data.sendTime.hour)}:${pad2(data.sendTime.minute === 30 ? 30 : 0)}`,
  )
  const [locale, setLocale] = useState(data.locale || 'sk')
  const [repeatOn, setRepeatOn] = useState(data.rules.some((r) => r.repeatUntilActioned))
  const [repeatDays, setRepeatDays] = useState(
    (data.rules.find((r) => r.repeatEveryDays)?.repeatEveryDays ?? 3).toString(),
  )
  const [recipients, setRecipients] = useState<Set<string>>(() => new Set(data.recipientIds))
  const [autoStatus, setAutoStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const buildPayload = (s: Snapshot) => {
    // IN_APP is the always-on baseline channel (not shown as a toggle), so always include it.
    const chans = [...new Set<Channel>([...s.channels, 'IN_APP'])]
    const rules = STAGE_UI.filter((st) => s.stages[st.stage].active).map((st) => ({
      stage: st.stage,
      leadDays: st.lead ? s.stages[st.stage].leadDays : 0,
      channels: chans,
      repeatUntilActioned: s.repeatOn && (st.stage === 'OVERDUE' || st.stage === 'BOOKING'),
      repeatEveryDays: s.repeatOn ? Number(s.repeatDays) : null,
    }))
    return {
      rules,
      recipients: s.recipients,
      sendHour: Number(s.sendTime.split(':')[0]) || 0,
      sendMinute: Number(s.sendTime.split(':')[1]) >= 30 ? 30 : 0,
      locale: s.locale,
    }
  }

  const serialize = (s: Snapshot) => JSON.stringify(s)

  const snapshot: Snapshot = {
    stages,
    channels: [...channels].sort(),
    sendTime,
    locale,
    repeatOn,
    repeatDays,
    recipients: [...recipients].sort(),
  }
  const serial = serialize(snapshot)

  // The snapshot currently persisted on the server (seeded from the loaded data).
  const savedSerialRef = useRef(serial)
  const undoRef = useRef<Snapshot | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Latest editable payload, read on unmount to flush a still-pending change.
  const latestRef = useRef({ serial, payload: buildPayload(snapshot) })
  latestRef.current = { serial, payload: buildPayload(snapshot) }

  const persist = async (payload: ReturnType<typeof buildPayload>) => {
    try {
      const res = await fetch(DEFAULTS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return res.ok
    } catch {
      return false
    }
  }

  const clearHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = null
  }

  const commit = async (target: Snapshot, undoTo: Snapshot | null) => {
    clearHide()
    setAutoStatus('saving')
    const ok = await persist(buildPayload(target))
    if (ok) {
      savedSerialRef.current = serialize(target)
      undoRef.current = undoTo
      setAutoStatus('saved')
      hideTimer.current = setTimeout(() => {
        setAutoStatus('idle')
        undoRef.current = null
      }, 6000)
    } else {
      setAutoStatus('error')
    }
  }

  // Debounced autosave: persist whenever the editable state differs from what's saved.
  useEffect(() => {
    if (!canModify) return
    if (serial === savedSerialRef.current) return
    const undoTo = JSON.parse(savedSerialRef.current) as Snapshot
    const id = setTimeout(() => {
      void commit(JSON.parse(serial) as Snapshot, undoTo)
    }, 900)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serial, canModify])

  // Flush a still-pending change on unmount (e.g. navigating to "manage contacts"),
  // using keepalive so the request completes after the component is gone.
  useEffect(() => {
    return () => {
      clearHide()
      if (!canModify) return
      if (latestRef.current.serial === savedSerialRef.current) return
      try {
        fetch(DEFAULTS_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(latestRef.current.payload),
          keepalive: true,
        }).catch(() => {})
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applySnapshot = (s: Snapshot) => {
    setStages(s.stages)
    setChannels(new Set(s.channels))
    setSendTime(s.sendTime)
    setLocale(s.locale)
    setRepeatOn(s.repeatOn)
    setRepeatDays(s.repeatDays)
    setRecipients(new Set(s.recipients))
  }

  const undo = async () => {
    const target = undoRef.current
    if (!target) return
    applySnapshot(target)
    // Pre-set the saved ref so the autosave effect doesn't re-fire for this revert.
    savedSerialRef.current = serialize(target)
    undoRef.current = null
    clearHide()
    setAutoStatus('saving')
    const ok = await persist(buildPayload(target))
    setAutoStatus(ok ? 'saved' : 'error')
    if (ok) hideTimer.current = setTimeout(() => setAutoStatus('idle'), 4000)
  }

  const saveNow = () => {
    if (serial === savedSerialRef.current) {
      clearHide()
      setAutoStatus('saved')
      hideTimer.current = setTimeout(() => setAutoStatus('idle'), 3000)
      return
    }
    void commit(snapshot, JSON.parse(savedSerialRef.current) as Snapshot)
  }

  const card = 'bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5'

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-light">{t('defaults.title')}</h1>
            <p className="text-gray-400">{t('defaults.subtitle')}</p>
          </div>
          <Link
            href="/client/my-fleet/get-started"
            className="shrink-0 inline-flex items-center gap-2 bg-pictus-lime/15 text-pictus-lime border border-pictus-lime/30 text-sm font-medium px-4 py-2 rounded-full hover:bg-pictus-lime/25"
          >
            <BookOpen className="w-4 h-4" /> {t('getStarted.button')}
          </Link>
        </header>

        <div className="flex items-start gap-2 rounded-2xl bg-pictus-lime/5 border border-pictus-lime/20 p-4 text-sm text-gray-300">
          <Info className="w-4 h-4 text-pictus-lime shrink-0 mt-0.5" />
          <p>{t('defaults.intro')}</p>
        </div>

        {!canModify && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-gray-400">
            {t('defaults.ownerOnly')}
          </div>
        )}

        <div className={card}>
          <h2 className="font-medium mb-1">{t('defaults.rulesTitle')}</h2>
          <p className="text-sm text-gray-400 mb-4">{t('defaults.rulesSub')}</p>
          <div className="space-y-3">
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

        <div className={card}>
          <h2 className="font-medium mb-1">{t('ev.channelsTitle')}</h2>
          <p className="text-sm text-gray-400 mb-4">{t('ev.channelsSub')}</p>
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

        <div className={card}>
          <h2 className="font-medium mb-1">{t('recipients.title')}</h2>
          <p className="text-sm text-gray-400 mb-4">{t('recipients.subtitle')}</p>
          <div className="space-y-2">
            {data.members.map((m) => {
              const on = recipients.has(m.userId)
              return (
                <button
                  key={m.userId}
                  type="button"
                  disabled={!canModify}
                  onClick={() =>
                    setRecipients((prev) => {
                      const n = new Set(prev)
                      if (n.has(m.userId)) n.delete(m.userId)
                      else n.add(m.userId)
                      return n
                    })
                  }
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-sm ${
                    on
                      ? 'bg-pictus-lime/15 text-pictus-white border-pictus-lime/30'
                      : 'bg-white/5 text-gray-300 border-white/10'
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
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 shrink-0" /> {t('recipients.note')}
          </p>
        </div>

        <div className={`${card} space-y-4`}>
          <h2 className="font-medium">{t('ev.advanced')}</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-pictus-white">{t('defaults.sendTime')}</p>
              <p className="text-xs text-gray-500">{t('defaults.sendTimeHint')}</p>
            </div>
            <input
              type="time"
              step={1800}
              className="bg-pictus-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-pictus-white [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
              value={sendTime}
              onChange={(e) => setSendTime(e.target.value)}
              disabled={!canModify}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-pictus-white">{t('defaults.language')}</p>
              <p className="text-xs text-gray-500">{t('defaults.languageHint')}</p>
            </div>
            <select
              className="bg-pictus-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-pictus-white"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              disabled={!canModify}
            >
              {LOCALE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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
            <Toggle on={repeatOn} disabled={!canModify} onClick={() => setRepeatOn((v) => !v)} />
          </div>
        </div>

        <CarCarePushToggle />

        {canModify && (
          <div className="flex items-center justify-end gap-3">
            <span className="text-xs text-gray-500">{t('defaults.autoSaveHint')}</span>
            <button
              onClick={saveNow}
              disabled={autoStatus === 'saving'}
              className="bg-pictus-lime text-pictus-black font-semibold px-6 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {autoStatus === 'saving' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('defaults.save')
              )}
            </button>
          </div>
        )}
      </div>

      {canModify && autoStatus !== 'idle' && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 pointer-events-none">
          <div
            className={`mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl pointer-events-auto ${
              autoStatus === 'error'
                ? 'bg-red-500/15 border-red-500/30 text-red-200'
                : 'bg-pictus-onyx900/95 border-pictus-lime/30 text-pictus-white'
            }`}
          >
            {autoStatus === 'saving' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pictus-lime shrink-0" />
                <span>{t('defaults.autoSaving')}</span>
              </>
            )}
            {autoStatus === 'saved' && (
              <>
                <Check className="w-4 h-4 text-pictus-lime shrink-0" />
                <span>{t('defaults.autoSaved')}</span>
                {undoRef.current && (
                  <button
                    onClick={undo}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-pictus-white hover:bg-white/10"
                  >
                    <Undo2 className="w-3.5 h-3.5" /> {t('defaults.undo')}
                  </button>
                )}
              </>
            )}
            {autoStatus === 'error' && (
              <>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t('defaults.saveFailed')}</span>
                <button
                  onClick={saveNow}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-400/40 px-3 py-1.5 text-red-100 hover:bg-red-500/20"
                >
                  {t('defaults.retry')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
