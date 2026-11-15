'use client'
import { EU_DIAL_CODES } from '@/lib/phone'

interface PhoneFieldProps {
  // The full phone string (e.g. "+421 900 123 456" or "" when empty).
  value: string
  onChange: (value: string) => void
  inputClassName?: string
  selectClassName?: string
  placeholder?: string
  id?: string
  name?: string
}

const DIALS_BY_LENGTH = [...EU_DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length)

// Split a stored full number into its EU dial prefix and the national part.
function split(value: string): { dial: string; national: string } {
  const v = (value || '').trim()
  for (const { dial } of DIALS_BY_LENGTH) {
    if (v.startsWith(dial)) return { dial, national: v.slice(dial.length).trim() }
  }
  return { dial: '+421', national: v.replace(/^\+/, '').trim() }
}

export default function PhoneField({
  value,
  onChange,
  inputClassName,
  selectClassName,
  placeholder,
  id,
  name,
}: PhoneFieldProps) {
  const { dial, national } = split(value)

  // Keep the stored value empty while there is no national part, so an optional phone stays
  // optional (a bare prefix must not count as "a number was entered").
  const emit = (nextDial: string, nextNational: string) => {
    const n = nextNational.replace(/[^\d\s]/g, '').trim()
    onChange(n ? `${nextDial} ${n}` : '')
  }

  return (
    <div className="flex gap-2">
      <select
        aria-label="Country code"
        className={
          selectClassName ??
          'px-3 py-3 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-pictus-lime'
        }
        value={dial}
        onChange={(e) => emit(e.target.value, national)}
      >
        {EU_DIAL_CODES.map((p) => (
          <option key={p.code} value={p.dial} className="bg-pictus-black">
            {p.dial} ({p.code})
          </option>
        ))}
      </select>
      <input
        type="tel"
        id={id}
        name={name}
        className={inputClassName}
        value={national}
        onChange={(e) => emit(dial, e.target.value)}
        placeholder={placeholder ?? '900 123 456'}
      />
    </div>
  )
}
