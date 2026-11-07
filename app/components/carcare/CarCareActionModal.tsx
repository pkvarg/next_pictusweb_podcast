'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, CalendarPlus, CheckCircle2 } from 'lucide-react'

export interface ActionOccurrence {
  id: string
  name: string
}

interface ProviderOption {
  id: string
  name: string
}

const inputClass =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none'
const labelClass = 'block text-sm text-gray-400 mb-1.5'

function todayLocal() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export default function CarCareActionModal({
  occurrence,
  onClose,
  onDone,
}: {
  occurrence: ActionOccurrence
  onClose: () => void
  onDone: () => void
}) {
  const [tab, setTab] = useState<'book' | 'done'>('book')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [scheduledAt, setScheduledAt] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [bookingReference, setBookingReference] = useState('')
  const [providerId, setProviderId] = useState('')
  const [providers, setProviders] = useState<ProviderOption[]>([])

  useEffect(() => {
    fetch('/api/carcare/providers')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setProviders(d.providers ?? []))
      .catch(() => setProviders([]))
  }, [])

  const [doneDate, setDoneDate] = useState(todayLocal())
  const [mileage, setMileage] = useState('')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')

  const book = async () => {
    setError(null)
    if (!scheduledAt) {
      setError('Zadajte dátum a čas návštevy.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/carcare/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occurrenceId: occurrence.id,
          scheduledAt: new Date(scheduledAt).toISOString(),
          providerId: providerId || null,
          estimatedCost: estimatedCost ? Number(estimatedCost) : null,
          bookingReference: bookingReference.trim() || null,
        }),
      })
      if (!res.ok) {
        setError('Objednávku sa nepodarilo uložiť.')
        return
      }
      onDone()
    } finally {
      setSubmitting(false)
    }
  }

  const complete = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/carcare/occurrences/${occurrence.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: doneDate ? new Date(doneDate).toISOString() : undefined,
          mileage: mileage ? Number(mileage) : null,
          cost: cost ? Number(cost) : null,
          notes: notes.trim() || null,
        }),
      })
      if (!res.ok) {
        setError('Záznam sa nepodarilo uložiť.')
        return
      }
      onDone()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-pictus-onyx900 border border-white/10 rounded-t-2xl sm:rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-medium text-pictus-white truncate">{occurrence.name}</h2>
            <p className="text-sm text-gray-400">Čo chcete urobiť?</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-pictus-white shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-pictus-black/40 rounded-full p-1 border border-white/10 mb-5">
          <button
            onClick={() => setTab('book')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${tab === 'book' ? 'bg-pictus-lime text-pictus-black font-semibold' : 'text-gray-300'}`}
          >
            <CalendarPlus className="w-4 h-4" /> Objednať
          </button>
          <button
            onClick={() => setTab('done')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${tab === 'done' ? 'bg-pictus-lime text-pictus-black font-semibold' : 'text-gray-300'}`}
          >
            <CheckCircle2 className="w-4 h-4" /> Hotovo
          </button>
        </div>

        {tab === 'book' ? (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Dátum a čas návštevy</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            {providers.length > 0 && (
              <div>
                <label className={labelClass}>Poskytovateľ</label>
                <select
                  className={inputClass}
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                >
                  <option value="">—</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Odhad. cena (€)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="0"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Referencia</label>
                <input
                  className={inputClass}
                  placeholder="č. objednávky"
                  value={bookingReference}
                  onChange={(e) => setBookingReference(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={book}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Potvrdiť objednávku'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Dátum</label>
                <input
                  type="date"
                  className={inputClass}
                  value={doneDate}
                  onChange={(e) => setDoneDate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Stav km</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="napr. 72450"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Cena (€)</label>
              <input
                type="number"
                inputMode="decimal"
                className={inputClass}
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Poznámka</label>
              <input
                className={inputClass}
                placeholder="voliteľné"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={complete}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Označiť ako hotové'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
