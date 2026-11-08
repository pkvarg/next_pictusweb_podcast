'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Link, useRouter } from '@/i18n/routing'
import { ArrowLeft, Search, Car, Loader2, Check, Upload, X } from 'lucide-react'
import { uploadAuthHeaders } from '@/lib/uploadTokenClient'

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

function powertrainLabel(v: string | null) {
  return POWERTRAIN_OPTIONS.find((o) => o.value === v)?.label ?? ''
}

const inputClass =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none'
const labelClass = 'block text-sm text-gray-400 mb-1.5'

export default function CarCareAddVehicleView() {
  const router = useRouter()

  const [registration, setRegistration] = useState('')
  const [nickname, setNickname] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [powertrain, setPowertrain] = useState('')
  const [year, setYear] = useState('')
  const [country, setCountry] = useState('SK')
  const [vin, setVin] = useState('')
  const { data: authSession } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    const lower = selected.name.toLowerCase()
    const looksLikeImage =
      selected.type.startsWith('image/') ||
      selected.type === '' ||
      lower.endsWith('.heic') ||
      lower.endsWith('.heif')
    if (!looksLikeImage) {
      setError('Prosím, nahrajte obrázok (JPG, PNG, WEBP alebo HEIC).')
      return
    }
    setFile(selected)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => setFilePreview(reader.result as string)
    reader.readAsDataURL(selected)
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null
    const org = (authSession?.user as { organization?: string } | undefined)?.organization
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (org) fd.append('organization', org)
      const res = await fetch(`${process.env.NEXT_PUBLIC_HONO_API_URL}/api/upload/fleetsync`, {
        method: 'POST',
        body: fd,
        headers: await uploadAuthHeaders('fleetsync'),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Nepodarilo sa nahrať obrázok.')
      }
      const data = await res.json()
      return data.imageUrl as string
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa nahrať obrázok.')
      return null
    } finally {
      setUploading(false)
    }
  }

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
  }, [query, picked])

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
    setSubmitting(true)
    try {
      let imageUrl: string | null = null
      if (file) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          setSubmitting(false)
          return
        }
      }
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
          image: imageUrl,
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

          <div>
            <label className={labelClass}>Fotka vozidla (voliteľné)</label>
            {filePreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={filePreview}
                  alt="Náhľad"
                  className="w-40 h-28 rounded-xl object-cover border border-white/10"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-pictus-black border border-white/20 flex items-center justify-center text-gray-300 hover:text-red-400"
                  aria-label="Odstrániť fotku"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 bg-pictus-black/40 border border-dashed border-white/15 rounded-xl px-4 py-5 text-gray-400 hover:border-pictus-lime/40 hover:text-pictus-white"
              >
                <Upload className="w-5 h-5" /> Nahrať fotku
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={handleFileChange}
            />
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
