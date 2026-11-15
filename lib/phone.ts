const KNOWN_DIALS = ['421', '420', '36', '43']

export function toE164(raw: string | null | undefined, defaultDial = '+421'): string | null {
  if (!raw) return null
  const trimmed = raw.trim().replace(/[\s()./-]/g, '')
  if (!trimmed) return null

  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '')
    return digits ? `+${digits}` : null
  }

  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return null

  if (digits.startsWith('00')) return `+${digits.slice(2)}`
  if (KNOWN_DIALS.some((d) => digits.startsWith(d))) return `+${digits}`

  const dial = defaultDial.replace(/\D/g, '')
  if (digits.startsWith('0')) return `+${dial}${digits.slice(1)}`
  return `+${dial}${digits}`
}

export function isValidE164(phone: string | null | undefined): boolean {
  return !!phone && /^\+\d{8,15}$/.test(phone)
}

// Canonical placeholder shown in every phone input across the app.
export const PHONE_PLACEHOLDER = '+421 900 123 456'

// EU dial codes for the shared phone-prefix dropdown. Primary markets first, then the rest.
export const EU_DIAL_CODES: { code: string; dial: string }[] = [
  { code: 'SK', dial: '+421' },
  { code: 'CZ', dial: '+420' },
  { code: 'HU', dial: '+36' },
  { code: 'AT', dial: '+43' },
  { code: 'BE', dial: '+32' },
  { code: 'BG', dial: '+359' },
  { code: 'HR', dial: '+385' },
  { code: 'CY', dial: '+357' },
  { code: 'DK', dial: '+45' },
  { code: 'EE', dial: '+372' },
  { code: 'FI', dial: '+358' },
  { code: 'FR', dial: '+33' },
  { code: 'DE', dial: '+49' },
  { code: 'GR', dial: '+30' },
  { code: 'IE', dial: '+353' },
  { code: 'IT', dial: '+39' },
  { code: 'LV', dial: '+371' },
  { code: 'LT', dial: '+370' },
  { code: 'LU', dial: '+352' },
  { code: 'MT', dial: '+356' },
  { code: 'NL', dial: '+31' },
  { code: 'PL', dial: '+48' },
  { code: 'PT', dial: '+351' },
  { code: 'RO', dial: '+40' },
  { code: 'SI', dial: '+386' },
  { code: 'ES', dial: '+34' },
  { code: 'SE', dial: '+46' },
]

// National significant number length per dialing code — mirrors the onboarding rule
// (SK must be exactly 9 digits; CZ/HU/AT between 6 and 12). Countries we don't know fall
// back to the generic E.164 length check.
const NSN_RULES: Record<string, { min: number; max: number }> = {
  '421': { min: 9, max: 9 }, // SK
  '420': { min: 6, max: 12 }, // CZ
  '36': { min: 6, max: 12 }, // HU
  '43': { min: 6, max: 12 }, // AT
}

// A phone field passes validation when it is empty (phone is optional) or normalizes to a
// valid E.164 number whose national part matches the country rules above — the same
// strictness the onboarding flow enforces. Shared so every form validates identically.
export function isAcceptablePhone(raw: string | null | undefined): boolean {
  if (!raw || !raw.trim()) return true // phone is optional
  const e164 = toE164(raw)
  if (!isValidE164(e164)) return false
  const digits = e164!.slice(1) // drop the leading '+'
  const dial = KNOWN_DIALS.find((d) => digits.startsWith(d))
  if (!dial) return true // valid E.164 for an unknown country — stay lenient
  const nsn = digits.slice(dial.length)
  const rule = NSN_RULES[dial]
  return !rule || (nsn.length >= rule.min && nsn.length <= rule.max)
}
