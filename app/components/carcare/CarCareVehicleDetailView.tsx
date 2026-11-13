'use client'

import { useRef, useState } from 'react'
import {
  ArrowLeft,
  Car,
  ChevronRight,
  Gauge,
  Plus,
  Wallet,
  CheckCircle2,
  CalendarCheck,
  Camera,
  Loader2,
  Pencil,
  Trash2,
  Bell,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Link, useRouter } from '@/i18n/routing'
import { templateKey, powertrainKey, categoryKey } from '@/lib/carcare/labels'
import { uploadVehicleImage } from '@/lib/carcare/vehicleImage'
import AddExpenseModal, { type VehicleOption } from './AddExpenseModal'
import { formatDate, formatDateTime } from '@/lib/carcare/datetime'
import AddEventModal from './AddEventModal'

type Tr = (key: string, values?: Record<string, string | number>) => string

export interface VdOccurrence {
  id: string
  status: string
  dueDate: string | null
  dueMileage: number | null
  overdue?: boolean
  nextNotificationAt?: string | null
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
  costs?: {
    thisYear: number
    allTime: number
    byCategory: { category: string; total: number }[]
    entries: {
      id: string
      source: 'event' | 'expense'
      title: string
      category: string
      date: string | null
      amount: number
      currency: string
    }[]
  }
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
function vehicleName(v: VehicleDetailData['vehicle']) {
  return v.nickname || [v.make, v.model].filter(Boolean).join(' ') || v.registration
}
function dueBadge(o: VdOccurrence, t: Tr): { text: string; tone: keyof typeof toneClass } {
  const d = daysUntil(o.dueDate)
  if (o.overdue)
    return { text: d != null ? t('badge.overdueDays', { d }) : t('badge.overdue'), tone: 'red' }
  if (o.status === 'ARRANGED') return { text: t('badge.arranged'), tone: 'lime' }
  if (o.status === 'ACTION_REQUIRED') return { text: t('badge.actionReq'), tone: 'red' }
  if (d != null) return { text: t('badge.inDays', { d }), tone: 'neutral' }
  return { text: t('badge.upcoming'), tone: 'neutral' }
}

const POWERTRAIN_OPTIONS = [
  'PETROL',
  'DIESEL',
  'MHEV',
  'HEV',
  'PHEV',
  'BEV',
  'LPG',
  'CNG',
  'HYDROGEN',
  'OTHER',
]
const fieldCls =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none'
const fieldLabelCls = 'block text-sm text-gray-400 mb-1.5'

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-pictus-white text-right">{value}</span>
    </div>
  )
}

export default function CarCareVehicleDetailView({
  data,
  reload,
}: {
  data: VehicleDetailData
  reload?: () => void
}) {
  const t = useTranslations('CarCare')
  const { data: authSession } = useSession()
  const { vehicle } = data
  const canModify = data.canModify !== false
  const [tab, setTab] = useState<'prehlad' | 'udalosti' | 'historia' | 'naklady'>('prehlad')
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [activated, setActivated] = useState<Set<string>>(new Set())
  const [showExpense, setShowExpense] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [image, setImage] = useState<string | null>(vehicle.image)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const onImagePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    setImageError(null)
    try {
      const org = (authSession?.user as { organization?: string } | undefined)?.organization
      const url = await uploadVehicleImage(file, org)
      const res = await fetch(`/api/carcare/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: url }),
      })
      if (!res.ok) throw new Error('save failed')
      setImage(url)
      reload?.()
    } catch {
      setImageError(t('vehicle.imageFailed'))
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const formFromVehicle = () => ({
    registration: vehicle.registration,
    nickname: vehicle.nickname ?? '',
    make: vehicle.make ?? '',
    model: vehicle.model ?? '',
    year: vehicle.year ? String(vehicle.year) : '',
    powertrain: vehicle.powertrain ?? '',
    vin: vehicle.vin ?? '',
    country: vehicle.country ?? '',
  })
  const [editing, setEditing] = useState(false)
  const [savingDetails, setSavingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [form, setForm] = useState(formFromVehicle)
  const setField = (k: keyof ReturnType<typeof formFromVehicle>, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  const cancelEdit = () => {
    setForm(formFromVehicle())
    setDetailsError(null)
    setEditing(false)
  }

  const saveDetails = async () => {
    if (!form.registration.trim()) {
      setDetailsError(t('vehicle.plateRequired'))
      return
    }
    setSavingDetails(true)
    setDetailsError(null)
    try {
      const res = await fetch(`/api/carcare/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration: form.registration.trim(),
          nickname: form.nickname.trim() || null,
          make: form.make.trim() || null,
          model: form.model.trim() || null,
          year: form.year ? Number(form.year) : null,
          powertrain: form.powertrain || null,
          vin: form.vin.trim() || null,
          country: form.country.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('save failed')
      setEditing(false)
      reload?.()
    } catch {
      setDetailsError(t('vehicle.saveFailed'))
    } finally {
      setSavingDetails(false)
    }
  }

  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const deleteVehicle = async () => {
    setDeleting(true)
    setDetailsError(null)
    try {
      const res = await fetch(`/api/carcare/vehicles/${vehicle.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      router.push('/client/my-fleet')
    } catch {
      setDetailsError(t('vehicle.deleteFailed'))
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const activate = async (key: string) => {
    setBusyKey(key)
    try {
      const res = await fetch('/api/carcare/events/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          templateKey: key,
          // Send the localized template name so the event isn't created as the English
          // humanized key (e.g. "Winter Tyres" instead of "Prezutie na zimné pneumatiky").
          name: templateKey(key) ? t(templateKey(key)!) : key,
        }),
      })
      if (res.ok) setActivated((prev) => new Set(prev).add(key))
    } finally {
      setBusyKey(null)
    }
  }

  const specs: { label: string; value: string }[] = [
    { label: t('vehicle.spzPlate'), value: vehicle.registration },
    vehicle.make || vehicle.model
      ? {
          label: t('vehicle.makeModel'),
          value: [vehicle.make, vehicle.model].filter(Boolean).join(' '),
        }
      : null,
    vehicle.year ? { label: t('vehicle.year'), value: String(vehicle.year) } : null,
    vehicle.powertrain
      ? {
          label: t('vehicle.powertrain'),
          value: powertrainKey(vehicle.powertrain)
            ? t(powertrainKey(vehicle.powertrain)!)
            : (vehicle.powertrain ?? ''),
        }
      : null,
    vehicle.vin ? { label: 'VIN', value: vehicle.vin } : null,
    vehicle.country ? { label: t('vehicle.country'), value: vehicle.country } : null,
  ].filter((x): x is { label: string; value: string } => x != null)

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <Link
          href="/client/my-fleet"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-pictus-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Link>

        <header className="flex items-start gap-4 mb-8">
          <div className="relative shrink-0 group">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={vehicleName(vehicle)}
                className="w-20 h-20 rounded-2xl object-cover border border-white/[0.06]"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-pictus-lime/15 flex items-center justify-center">
                <Car className="w-8 h-8 text-pictus-lime" />
              </div>
            )}
            {canModify && (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                aria-label={image ? t('vehicle.changePhoto') : t('vehicle.addPhoto')}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-pictus-lime text-pictus-black flex items-center justify-center border-2 border-pictus-black hover:bg-pictus-lime600 disabled:opacity-60"
              >
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={onImagePicked}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-light truncate">{vehicleName(vehicle)}</h1>
            <p className="text-gray-400">
              {vehicle.registration}
              {vehicle.year ? ` · ${vehicle.year}` : ''}
            </p>
            {imageError && <p className="text-sm text-red-400 mt-1">{imageError}</p>}
          </div>
        </header>

        <div className="flex gap-1 overflow-x-auto mb-6 border-b border-white/[0.06]">
          {(
            [
              ['prehlad', t('vehicle.tabOverview')],
              ['udalosti', t('vehicle.tabEvents')],
              ['historia', t('vehicle.tabHistory')],
              ['naklady', t('vehicle.tabCosts')],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`shrink-0 px-4 py-2.5 text-sm border-b-2 -mb-px ${
                tab === k
                  ? 'border-pictus-lime text-pictus-white'
                  : 'border-transparent text-gray-400 hover:text-pictus-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === 'prehlad' && (
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
                {data.latestMileage
                  ? t('vehicle.mileageAt', { date: formatDate(data.latestMileage.date) })
                  : t('vehicle.mileageEmpty')}
              </div>
            </div>
            <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06] flex flex-col gap-1">
              <div className="text-gray-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-pictus-white">
                {data.costThisYear.toFixed(0)} €
              </div>
              <div className="text-xs text-gray-400">{t('vehicle.costThisYear')}</div>
            </div>
          </div>
        )}

        {tab === 'udalosti' && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">{t('vehicle.tabEvents')}</h2>
              {canModify && (
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium bg-pictus-lime text-pictus-black px-4 py-2 rounded-full hover:bg-pictus-lime600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> {t('vehicle.addEvent')}
                </button>
              )}
            </div>
            {data.occurrences.length === 0 ? (
              <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
                {t('vehicle.eventsEmpty')}
              </div>
            ) : (
              <div className="space-y-3">
                {data.occurrences.map((o) => {
                  const badge = dueBadge(o, t)
                  const actionable = o.status === 'ACTION_REQUIRED' || o.overdue
                  const inner = (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="text-pictus-white font-medium truncate">
                          {o.recurringEvent.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {o.appointment
                            ? `${t('vehicle.visit', { date: formatDateTime(o.appointment.scheduledAt) })}${o.appointment.provider ? ` · ${o.appointment.provider.name}` : ''}`
                            : o.dueDate
                              ? t('vehicle.due', { date: formatDate(o.dueDate) })
                              : o.dueMileage
                                ? t('vehicle.atKm', { km: o.dueMileage.toLocaleString('sk-SK') })
                                : t('vehicle.noDue')}
                        </p>
                        {o.nextNotificationAt && (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-pictus-lime truncate">
                            <Bell className="w-3 h-3 shrink-0" />
                            {t('vehicle.nextNotification', {
                              datetime: formatDateTime(o.nextNotificationAt),
                            })}
                          </p>
                        )}
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
                      {canModify && actionable ? (
                        <span className="shrink-0 bg-pictus-lime text-pictus-black text-sm font-semibold px-4 py-1.5 rounded-full">
                          {t(`action.${o.recurringEvent.actionType}`)}
                        </span>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                      )}
                    </>
                  )
                  const base =
                    'w-full text-left flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors'
                  return (
                    <Link
                      key={o.id}
                      href={`/client/my-fleet/events/${o.recurringEvent.id}`}
                      className={base}
                    >
                      {inner}
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {tab === 'prehlad' && canModify && data.suggestions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">{t('vehicle.suggested')}</h2>
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
                        {templateKey(s.key) ? t(templateKey(s.key)!) : s.key}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {s.kind === 'LEGAL' ? t('vehicle.legal') : t('vehicle.recommended')}
                      </p>
                    </div>
                    {done ? (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-sm text-pictus-lime">
                        <CheckCircle2 className="w-4 h-4" /> {t('vehicle.tracked')}
                      </span>
                    ) : (
                      <button
                        onClick={() => activate(s.key)}
                        disabled={busyKey === s.key}
                        className="shrink-0 inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-pictus-white text-sm font-medium px-4 py-1.5 rounded-full border border-white/10 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" /> {t('vehicle.track')}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {tab === 'historia' && data.history.length === 0 && (
          <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
            {t('vehicle.historyEmpty')}
          </div>
        )}

        {tab === 'historia' && data.history.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">{t('vehicle.tabHistory')}</h2>
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

        {tab === 'naklady' && (
          <section className="mb-8 space-y-3">
            <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Wallet className="w-5 h-5" />
                    <span className="text-sm">{t('costs.thisYear')}</span>
                  </div>
                  <div className="mt-1 text-3xl font-bold text-pictus-white">
                    {(data.costs?.thisYear ?? 0).toFixed(0)} €
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {t('costs.allTime')}: {(data.costs?.allTime ?? 0).toFixed(0)} €
                  </div>
                </div>
                {canModify && (
                  <button
                    onClick={() => setShowExpense(true)}
                    className="shrink-0 inline-flex items-center gap-1.5 bg-pictus-lime text-pictus-black text-sm font-semibold px-4 py-1.5 rounded-full"
                  >
                    <Plus className="w-4 h-4" /> {t('vehicle.addExpense')}
                  </button>
                )}
              </div>

              {data.costs && data.costs.byCategory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-1">
                  {data.costs.byCategory.map((c) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between py-1.5 text-sm"
                    >
                      <span className="text-gray-400">
                        {categoryKey(c.category) ? t(categoryKey(c.category)!) : c.category}
                      </span>
                      <span className="text-gray-300">{c.total.toFixed(0)} €</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!data.costs || data.costs.entries.length === 0 ? (
              <div className="p-8 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
                {t('vehicle.costsEmpty')}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-3">{t('costs.recent')}</h2>
                <div className="space-y-3">
                  {data.costs.entries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-pictus-white font-medium truncate">{e.title}</p>
                        <p className="text-sm text-gray-400 truncate">{formatDate(e.date)}</p>
                      </div>
                      <span className="shrink-0 text-sm text-gray-300">
                        {e.amount.toFixed(0)} {e.currency === 'EUR' ? '€' : e.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {tab === 'prehlad' && vehicle.note && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">{t('vehicle.note')}</h2>
            <div className="p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-300 whitespace-pre-wrap">
              {vehicle.note}
            </div>
          </section>
        )}

        {tab === 'prehlad' && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">{t('vehicle.details')}</h2>
              {canModify && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-pictus-lime hover:text-pictus-lime600"
                >
                  <Pencil className="w-4 h-4" /> {t('vehicle.edit')}
                </button>
              )}
            </div>
            <div className="bg-pictus-onyx900 rounded-2xl p-4 border border-white/[0.06]">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className={fieldLabelCls}>{t('vehicle.nickname')}</label>
                    <input
                      className={fieldCls}
                      value={form.nickname}
                      onChange={(e) => setField('nickname', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={fieldLabelCls}>{t('vehicle.spzPlate')}</label>
                      <input
                        className={fieldCls}
                        value={form.registration}
                        onChange={(e) => setField('registration', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={fieldLabelCls}>{t('vehicle.year')}</label>
                      <input
                        type="number"
                        className={fieldCls}
                        value={form.year}
                        onChange={(e) => setField('year', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={fieldLabelCls}>{t('vehicle.make')}</label>
                      <input
                        className={fieldCls}
                        value={form.make}
                        onChange={(e) => setField('make', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={fieldLabelCls}>{t('vehicle.model')}</label>
                      <input
                        className={fieldCls}
                        value={form.model}
                        onChange={(e) => setField('model', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={fieldLabelCls}>{t('vehicle.powertrain')}</label>
                      <select
                        className={fieldCls}
                        value={form.powertrain}
                        onChange={(e) => setField('powertrain', e.target.value)}
                      >
                        <option value="">—</option>
                        {POWERTRAIN_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {powertrainKey(p) ? t(powertrainKey(p)!) : p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={fieldLabelCls}>{t('vehicle.country')}</label>
                      <input
                        className={fieldCls}
                        maxLength={2}
                        value={form.country}
                        onChange={(e) => setField('country', e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={fieldLabelCls}>VIN</label>
                    <input
                      className={fieldCls}
                      value={form.vin}
                      onChange={(e) => setField('vin', e.target.value)}
                    />
                  </div>
                  {detailsError && <p className="text-sm text-red-400">{detailsError}</p>}
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-pictus-white hover:bg-white/5"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={saveDetails}
                      disabled={savingDetails}
                      className="inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-5 py-2.5 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50"
                    >
                      {savingDetails ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        t('common.save')
                      )}
                    </button>
                  </div>
                  {canModify && (
                    <div className="border-t border-white/[0.06] pt-4 mt-2">
                      {confirmDelete ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-300">{t('vehicle.deleteConfirm')}</p>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setConfirmDelete(false)}
                              className="px-4 py-2.5 rounded-xl border border-white/10 text-pictus-white hover:bg-white/5"
                            >
                              {t('common.cancel')}
                            </button>
                            <button
                              onClick={deleteVehicle}
                              disabled={deleting}
                              className="inline-flex items-center justify-center gap-2 bg-red-500/90 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-500 disabled:opacity-50"
                            >
                              {deleting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" /> {t('vehicle.deleteConfirmBtn')}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" /> {t('vehicle.delete')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                specs.map((s) => <SpecRow key={s.label} label={s.label} value={s.value} />)
              )}
            </div>
          </section>
        )}
      </div>

      {showExpense && (
        <AddExpenseModal
          vehicles={
            [{ id: data.vehicle.id, label: vehicleName(data.vehicle) }] satisfies VehicleOption[]
          }
          defaultVehicleId={data.vehicle.id}
          onClose={() => setShowExpense(false)}
          onSaved={() => reload?.()}
        />
      )}

      {showAddEvent && (
        <AddEventModal
          vehicles={
            [{ id: data.vehicle.id, label: vehicleName(data.vehicle) }] satisfies VehicleOption[]
          }
          defaultVehicleId={data.vehicle.id}
          onClose={() => setShowAddEvent(false)}
          onSaved={() => reload?.()}
        />
      )}
    </div>
  )
}
