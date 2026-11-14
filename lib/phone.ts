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
