import { describe, it, expect } from 'vitest'
import { resolveNotificationLimit } from '@/lib/notificationLimits'

describe('resolveNotificationLimit', () => {
  it('a per-org override always wins (admin-set)', () => {
    expect(resolveNotificationLimit(250, 100, 5, 10000)).toBe(250)
    expect(resolveNotificationLimit(0, 100, 5, 10000)).toBe(0)
  })

  it('scales with vehicle count when the tier has a per-vehicle rate', () => {
    // BUSINESS = 100 SMS / vehicle / year
    expect(resolveNotificationLimit(null, 100, 3, 10000)).toBe(300)
    expect(resolveNotificationLimit(null, 100, 5, 10000)).toBe(500)
    // BASIC = 50
    expect(resolveNotificationLimit(null, 50, 4, 1000)).toBe(200)
  })

  it('adding vehicles raises the allowance (3 -> 5 on BUSINESS)', () => {
    const before = resolveNotificationLimit(null, 100, 3, 10000)
    const after = resolveNotificationLimit(null, 100, 5, 10000)
    expect(after - before).toBe(200)
  })

  it('falls back to the flat tier limit when there is no per-vehicle rate (FREE trial)', () => {
    expect(resolveNotificationLimit(null, 0, 5, 100)).toBe(100)
  })

  it('is zero when nothing is configured', () => {
    expect(resolveNotificationLimit(null, 0, 5, null)).toBe(0)
  })
})
