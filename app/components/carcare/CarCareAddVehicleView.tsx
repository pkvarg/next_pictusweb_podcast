'use client'

import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import { ArrowLeft, Search, Car, Loader2, Check } from 'lucide-react'

interface CatalogueEntry {
  id: string
  make: string
  model: string
  powertrain: string | null
  yearFrom?: number | null
}

const POWERTRAIN_OPTIONS: { value: string; label: string }[] = [
  { value: 'PETROL', label: 'Benzín' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'MHEV', label: 'Mild hybrid' },
  { value: 'HEV', label: 'Hybrid' },
  { value: 'PHEV', label: 'Plug-in hybrid' },
  { value: 'BEV', label: 'Elektromobil' },
  { value: 'LPG', label: 'LPG' },
  { value: 'CNG', label: 'CNG' },
  { value: 'HYDROGEN', label: 'Vodík' },
  { value: 'OTHER', label: 'Iné' },
]

const PREVIEW_CATALOGUE: CatalogueEntry[] = [
  { id: 'c1', make: 'Škoda', model: 'Octavia', powertrain: 'DIESEL', yearFrom: 2013 },
  { id: 'c2', make: 'Škoda', model: 'Fabia', powertrain: 'PETROL', yearFrom: 2015 },
  { id: 'c3', make: 'Volkswagen', model: 'Golf', powertrain: 'PETROL', yearFrom: 2012 },
  { id: 'c4', make: 'Kia', model: 'Sportage', powertrain: 'PETROL', yearFrom: 2016 },
]

function powertrainLabel(v: string | null) {
  return POWERTRAIN_OPTIONS.find((o) => o.value === v)?.label ?? ''
}

const inputClass =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none'
const labelClass = 'block text-sm text-gray-400 mb-1.5'

export default function CarCareAddVehicleView({ preview = false }: { preview?: boolean }) {
  const router = useRouter()

  const [registration, setRegistration] = useState('')
  const [nickname, setNickname] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [powertrain, setPowertrain] = useState('')
  const [year, setYear] = useState('')
  const [country, setCountry] = useState('SK')
  const [vin, setVin] = useState('')

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CatalogueEntry[]>([])
  const [showResults, setShowResults] = useState(false)
  const [picked, setPicked] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (picked || query.trim().length < 2) {
      setResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (preview) {
        const q = query.trim().toLowerCase()
        setResults(
          PREVIEW_CATALOGUE.filter(
            (e) => e.make.toLowerCase().includes(q) || e.model.toLowerCase().includes(q),
          ),
        )
        setShowResults(true)
        return
      }
      try {
        const res = await fetch(`/api/carcare/catalogue?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const d = await res.json()
          setResults(d.results ?? [])
          setShowResults(true)
        }
      } catch {
        setResults([])
      }
    }, 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, picked, preview])

  const pick = (e: CatalogueEntry) => {
    setMake(e.make)
    setModel(e.model)
    if (e.powertrain) setPowertrain(e.powertrain)
    setQuery(`${e.make} ${e.model}`)
    setPicked(true)
    setShowResults(false)
  }

  const resetPick = () => {
    setPicked(false)
    setQuery('')
    setMake('')
    setModel('')
    setPowertrain('')
  }

  const submit = async () => {
    setError(null)
    if (!registration.trim()) {
      setError('ŠPZ je povinná.')
      return
    }
    if (preview) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/carcare/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration: registration.trim(),
          nickname: nickname.trim() || null,
          make: make.trim() || null,
          model: model.trim() || null,
          powertrain: powertrain || null,
          country: country.trim() || null,
          vin: vin.trim() || null,
          year: year ? Number(year) : null,
        }),
      })
      if (!res.ok) {
        setError('Vozidlo sa nepodarilo uložiť.')
        setSubmitting(false)
        return
      }
      const d = await res.json()
      router.push(`/carcare/vehicles/${d.vehicle.id}`)
    } catch {
      setError('Vozidlo sa nepodarilo uložiť.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
        <Link
          href="/carcare"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-pictus-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Späť
        </Link>

        <header className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-pictus-lime/15 flex items-center justify-center shrink-0">
            <Car className="w-7 h-7 text-pictus-lime" />
          </div>
          <div>
            <h1 className="text-3xl font-light">Pridať vozidlo</h1>
            <p className="text-gray-400">Vyhľadajte model alebo zadajte údaje ručne</p>
          </div>
        </header>

        <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-5">
          <div className="relative">
            <label className={labelClass}>Značka a model</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="napr. Škoda Octavia"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (picked) setPicked(false)
                }}
                onFocus={() => results.length > 0 && setShowResults(true)}
              />
              {picked && (
                <button
                  onClick={resetPick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pictus-lime hover:text-pictus-lime600"
                >
                  Zmeniť
                </button>
              )}
            </div>
            {showResults && results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-pictus-onyx900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                {results.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => pick(e)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/5"
                  >
                    <span className="text-pictus-white">
                      {e.make} {e.model}
                    </span>
                    <span className="text-xs text-gray-400">
                      {powertrainLabel(e.powertrain)}
                      {e.yearFrom ? ` · od ${e.yearFrom}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              ŠPZ <span className="text-pictus-lime">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="BA123CD"
              maxLength={20}
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <label className={labelClass}>Prezývka</label>
            <input
              className={inputClass}
              placeholder="napr. Rodinné auto"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Značka</label>
              <input
                className={inputClass}
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Model</label>
              <input
                className={inputClass}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Pohon</label>
              <select
                className={inputClass}
                value={powertrain}
                onChange={(e) => setPowertrain(e.target.value)}
              >
                <option value="">—</option>
                {POWERTRAIN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Rok výroby</label>
              <input
                className={inputClass}
                type="number"
                inputMode="numeric"
                placeholder="2021"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Krajina</label>
              <input
                className={inputClass}
                maxLength={2}
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className={labelClass}>VIN</label>
              <input
                className={inputClass}
                maxLength={20}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" /> Uložiť vozidlo
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-500">
            Po uložení vám navrhneme, čo pri tomto vozidle sledovať.
          </p>
        </div>
      </div>
    </div>
  )
}
