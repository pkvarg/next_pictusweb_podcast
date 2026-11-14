import { describe, it, expect } from 'vitest'
import { toE164, isValidE164, isAcceptablePhone } from '@/lib/phone'

describe('toE164', () => {
  it('keeps an existing international number', () => {
    expect(toE164('+421 900 123 456')).toBe('+421900123456')
  })
  it('expands a national 0-number with the default dial', () => {
    expect(toE164('0900 123 456')).toBe('+421900123456')
  })
  it('treats 00 as the international prefix', () => {
    expect(toE164('00421900123456')).toBe('+421900123456')
  })
  it('recognises a known dial code without +', () => {
    expect(toE164('421900123456')).toBe('+421900123456')
  })
  it('returns null for empty/garbage', () => {
    expect(toE164('')).toBeNull()
    expect(toE164('   ')).toBeNull()
    expect(toE164(null)).toBeNull()
  })
})

describe('isValidE164', () => {
  it('accepts 8–15 digit E.164', () => {
    expect(isValidE164('+421900123456')).toBe(true)
    expect(isValidE164('+12025550147')).toBe(true)
  })
  it('rejects malformed', () => {
    expect(isValidE164('+421900')).toBe(false)
    expect(isValidE164('421900123456')).toBe(false)
    expect(isValidE164(null)).toBe(false)
  })
})

describe('isAcceptablePhone (country-aware, same rules as onboarding)', () => {
  it('empty is acceptable (phone is optional)', () => {
    expect(isAcceptablePhone('')).toBe(true)
    expect(isAcceptablePhone(null)).toBe(true)
  })
  it('SK requires exactly 9 national digits', () => {
    expect(isAcceptablePhone('+421 900 123 456')).toBe(true)
    expect(isAcceptablePhone('0900123456')).toBe(true)
    expect(isAcceptablePhone('+42190012345')).toBe(false) // 8 digits
    expect(isAcceptablePhone('+4219001234567')).toBe(false) // 10 digits
  })
  it('CZ/HU/AT allow 6–12 national digits', () => {
    expect(isAcceptablePhone('+420123456')).toBe(true)
    expect(isAcceptablePhone('+36201234567')).toBe(true)
    expect(isAcceptablePhone('+4312345')).toBe(false) // 5 digits, too short
  })
  it('unknown country stays lenient (valid E.164 passes)', () => {
    expect(isAcceptablePhone('+1 202 555 0147')).toBe(true)
  })
  it('rejects non-numeric / too short', () => {
    expect(isAcceptablePhone('abc')).toBe(false)
    expect(isAcceptablePhone('+421900')).toBe(false)
  })
})
