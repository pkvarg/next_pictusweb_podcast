'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, X } from 'lucide-react'
import type { VehicleOption } from './AddExpenseModal'

const input =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer'
const labelCls = 'block text-sm text-gray-400 mb-1.5'

const CATEGORY_KEYS = [
  'inspection',
  'service',
  'insurance',
  'tyres',
  'vignette',
  'permit',
  'warranty',
  'subscription',
  'other',
]
const RECURRENCE_KEYS = [
  'ONE_TIME',
  'FIXED_INTERVAL',
  'AFTER_COMPLETION',
  'SEASONAL',
  'MILEAGE',
  'DATE_OR_MILEAGE',
]
const RECURRENCE_LABEL_KEY: Record<string, string> = {
  ONE_TIME: 'ev.recOneTime',
  FIXED_INTERVAL: 'ev.recFixedInterval',
  AFTER_COMPLETION: 'ev.recAfterCompletion',
  SEASONAL: 'ev.recSeasonal',
  MILEAGE: 'ev.recMileage',
  DATE_OR_MILEAGE: 'ev.recDateOrMileage',
}

export default function AddEventModal({
  vehicles,
  defaultVehicleId,
  onClose,
  onSaved,
}: {
  vehicles: VehicleOption[]
  defaultVehicleId?: string
  onClose: () => void
  onSaved: () => void
}) {
  const t = useTranslations('CarCare')
  const [vehicleId, setVehicleId] = useState(defaultVehicleId ?? vehicles[0]?.id ?? '')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('service')
  const [recurrenceType, setRecurrenceType] = useState('ONE_TIME')
  const [intervalMonths, setIntervalMonths] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!vehicleId || !name.trim() || !category) {
      setError(t('addEvent.nameRequired'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/carcare/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          name: name.trim(),
          category,
          kind: 'RECOMMENDED',
          actionType: 'CUSTOM',
          recurrenceType,
          intervalMonths:
            recurrenceType === 'FIXED_INTERVAL' && intervalMonths ? Number(intervalMonths) : null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      })
      if (!res.ok) {
        setError(t('addEvent.saveFailed'))
        return
      }
      onSaved()
      onClose()
    } catch {
      setError(t('addEvent.saveFailed'))
    } finally {
      setBusy(false)
    }
  }

  const single = vehicles.length <= 1

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-pictus-onyx900 border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-pictus-white">{t('addEvent.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-pictus-white"
            aria-label={t('common.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!single && (
          <div>
            <label className={labelCls}>{t('addEvent.vehicle')}</label>
            <select
              className={input}
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              <option value="">{t('addEvent.pickVehicle')}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelCls}>{t('addEvent.name')}</label>
          <input
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('addEvent.namePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('addEvent.category')}</label>
            <select
              className={input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_KEYS.map((c) => (
                <option key={c} value={c}>
                  {t(`cat.${c}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t('addEvent.recurrence')}</label>
            <select
              className={input}
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
            >
              {RECURRENCE_KEYS.map((r) => (
                <option key={r} value={r}>
                  {t(RECURRENCE_LABEL_KEY[r])}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {recurrenceType === 'FIXED_INTERVAL' && (
            <div>
              <label className={labelCls}>{t('ev.fieldIntervalMonths')}</label>
              <input
                type="number"
                className={input}
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className={labelCls}>{t('addEvent.dueDate')}</label>
            <input
              type="date"
              className={input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-pictus-white hover:bg-white/5"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
