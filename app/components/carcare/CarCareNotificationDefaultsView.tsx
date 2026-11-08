'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Loader2,
  Info,
  Mail,
  MessageSquare,
  Smartphone,
  AppWindow,
  User as UserIcon,
  Check,
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { Channel } from '@prisma/client'

interface RuleData {
  stage: string
  leadDays: number
  channels: Channel[]
  repeatUntilActioned: boolean
  repeatEveryDays: number | null
}

export interface DefaultsData {
  canModify: boolean
  rules: RuleData[]
  members: { userId: string; name: string }[]
  recipientIds: string[]
  quietHours: { start: number | null; end: number | null }
}

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
  const [quietOn, setQuietOn] = useState(
    data.quietHours.start != null && data.quietHours.end != null,
  )
  const [quietStart, setQuietStart] = useState((data.quietHours.start ?? 22).toString())
  const [quietEnd, setQuietEnd] = useState((data.quietHours.end ?? 8).toString())
  const [repeatOn, setRepeatOn] = useState(data.rules.some((r) => r.repeatUntilActioned))
  const [repeatDays, setRepeatDays] = useState(
    (data.rules.find((r) => r.repeatEveryDays)?.repeatEveryDays ?? 3).toString(),
  )
  const [recipients, setRecipients] = useState<Set<string>>(() => new Set(data.recipientIds))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const save = async () => {
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
      const res = await fetch('/api/carcare/notifications/defaults', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rules,
          recipients: [...recipients],
          quietHoursStart: quietOn ? Number(quietStart) : null,
          quietHoursEnd: quietOn ? Number(quietEnd) : null,
        }),
      })
      setMsg(res.ok ? t('defaults.saved') : t('defaults.saveFailed'))
    } catch {
      setMsg(t('defaults.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  const card = 'bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5'

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-5">
        <header>
          <h1 className="text-3xl font-light">{t('defaults.title')}</h1>
          <p className="text-gray-400">{t('defaults.subtitle')}</p>
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
          <h2 className="font-medium mb-1">{t('ev.notifTitle')}</h2>
          <p className="text-sm text-gray-400 mb-4">{t('ev.notifSub')}</p>
          <div className="space-y-3">
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

        <div className={card}>
          <h2 className="font-medium mb-1">{t('ev.channelsTitle')}</h2>
          <p className="text-sm text-gray-400 mb-4">{t('ev.channelsSub')}</p>
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
            <Toggle on={quietOn} disabled={!canModify} onClick={() => setQuietOn((v) => !v)} />
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

        {msg && <p className="text-sm text-pictus-lime">{msg}</p>}

        {canModify && (
          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={busy}
              className="bg-pictus-lime text-pictus-black font-semibold px-6 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : t('defaults.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
