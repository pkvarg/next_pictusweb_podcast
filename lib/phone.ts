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
