'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, X } from 'lucide-react'

export interface VehicleOption {
  id: string
  label: string
}

const input =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer'
const labelCls = 'block text-sm text-gray-400 mb-1.5'

export default function AddExpenseModal({
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
  const [item, setItem] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!vehicleId || !item.trim() || !cost || Number(cost) < 0) {
      setError(t('expense.itemRequired'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/carcare/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          item: item.trim(),
          cost: Number(cost),
          date: date ? new Date(date).toISOString() : undefined,
          note: note.trim() || null,
        }),
      })
      if (!res.ok) {
        setError(t('expense.saveFailed'))
        return
      }
      onSaved()
      onClose()
    } catch {
      setError(t('expense.saveFailed'))
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
        className="w-full sm:max-w-md bg-pictus-onyx900 border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-pictus-white">{t('expense.title')}</h2>
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
            <label className={labelCls}>{t('expense.vehicle')}</label>
            <select
              className={input}
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelCls}>{t('expense.item')}</label>
          <input
            className={input}
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder={t('expense.itemPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('expense.amount')}</label>
            <input
              type="number"
              className={input}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>{t('expense.date')}</label>
            <input
              type="date"
              className={input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>
            {t('expense.note')} <span className="text-gray-600">({t('common.optional')})</span>
          </label>
          <input className={input} value={note} onChange={(e) => setNote(e.target.value)} />
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
