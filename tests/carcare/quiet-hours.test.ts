import { describe, it, expect } from 'vitest'
import { applyQuietHours } from '@/lib/carcare/scheduler'

const TZ = 'Europe/Bratislava'
const localHour = (d: Date) =>
  Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(d),
  ) % 24

describe('applyQuietHours (T15)', () => {
  it('pushes a 23:00-local send to 07:00 local (quiet 22:00–07:00)', () => {
    const when = new Date('2026-01-22T22:00:00Z') // 23:00 local (winter, UTC+1)
    expect(localHour(when)).toBe(23)
    const out = applyQuietHours(when, TZ, 22, 7)
    expect(localHour(out)).toBe(7)
  })

  it('leaves a daytime send unchanged', () => {
    const when = new Date('2026-01-22T11:00:00Z') // 12:00 local
    expect(applyQuietHours(when, TZ, 22, 7).getTime()).toBe(when.getTime())
  })

  it('is a no-op when quiet hours are unset', () => {
    const when = new Date('2026-01-22T22:00:00Z')
    expect(applyQuietHours(when, TZ, null, null).getTime()).toBe(when.getTime())
  })
})
