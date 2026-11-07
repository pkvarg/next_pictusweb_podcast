import { describe, it, expect } from 'vitest'
import {
  computeNextDue,
  addMonthsUTC,
  nextSeasonalUTC,
  type RecurrenceDefinition,
  type PreviousOccurrence,
} from '@/lib/carcare/recurrence'

const d = (iso: string) => new Date(iso)

describe('computeNextDue', () => {
  it('ONE_TIME has no successor', () => {
    const def: RecurrenceDefinition = { recurrenceType: 'ONE_TIME' }
    expect(computeNextDue(def, { dueDate: d('2026-02-06T00:00:00Z') })).toEqual({
      dueDate: null,
      dueMileage: null,
    })
  })

  it('T2: FIXED_INTERVAL anchors on the previous DUE date (no drift when completed late)', () => {
    const def: RecurrenceDefinition = { recurrenceType: 'FIXED_INTERVAL', intervalMonths: 24 }
    const prev: PreviousOccurrence = {
      dueDate: d('2026-02-06T00:00:00Z'),
      completedAt: d('2026-03-18T00:00:00Z'), // 40 days late
    }
    expect(computeNextDue(def, prev).dueDate?.toISOString()).toBe('2028-02-06T00:00:00.000Z')
  })

  it('T3: AFTER_COMPLETION anchors on the completion date (drifts with late completion)', () => {
    const def: RecurrenceDefinition = { recurrenceType: 'AFTER_COMPLETION', intervalMonths: 24 }
    const prev: PreviousOccurrence = {
      dueDate: d('2026-02-06T00:00:00Z'),
      completedAt: d('2026-03-18T00:00:00Z'),
    }
    expect(computeNextDue(def, prev).dueDate?.toISOString()).toBe('2028-03-18T00:00:00.000Z')
  })

  it('T4: SEASONAL rolls to next year when completed after the season date', () => {
    const def: RecurrenceDefinition = {
      recurrenceType: 'SEASONAL',
      seasonalMonth: 3,
      seasonalDay: 15,
    }
    const prev: PreviousOccurrence = { completedAt: d('2026-11-20T00:00:00Z') }
    // next 15 March after Nov 2026 = 2027-03-15
    expect(computeNextDue(def, prev).dueDate?.toISOString()).toBe('2027-03-15T00:00:00.000Z')
  })

  it('T5: month-end clamps (31 Jan + 1 month) in both non-leap and leap years', () => {
    const def: RecurrenceDefinition = { recurrenceType: 'FIXED_INTERVAL', intervalMonths: 1 }
    // 2026 is not a leap year -> 28 Feb
    expect(computeNextDue(def, { dueDate: d('2026-01-31T00:00:00Z') }).dueDate?.toISOString()).toBe(
      '2026-02-28T00:00:00.000Z',
    )
    // 2028 is a leap year -> 29 Feb
    expect(computeNextDue(def, { dueDate: d('2028-01-31T00:00:00Z') }).dueDate?.toISOString()).toBe(
      '2028-02-29T00:00:00.000Z',
    )
  })

  it('T6: DATE_OR_MILEAGE returns both a date and a mileage threshold', () => {
    const def: RecurrenceDefinition = {
      recurrenceType: 'DATE_OR_MILEAGE',
      intervalMonths: 12,
      intervalKm: 15000,
    }
    const prev: PreviousOccurrence = {
      dueDate: d('2026-01-10T00:00:00Z'),
      completedMileage: 42000,
    }
    const r = computeNextDue(def, prev)
    expect(r.dueDate?.toISOString()).toBe('2027-01-10T00:00:00.000Z')
    expect(r.dueMileage).toBe(57000)
  })

  it('FIXED_INTERVAL supports day intervals (e.g. every 14 days)', () => {
    const def: RecurrenceDefinition = { recurrenceType: 'FIXED_INTERVAL', intervalDays: 14 }
    expect(computeNextDue(def, { dueDate: d('2026-01-10T00:00:00Z') }).dueDate?.toISOString()).toBe(
      '2026-01-24T00:00:00.000Z',
    )
  })

  it('intervalDays takes precedence over intervalMonths when both are set', () => {
    const def: RecurrenceDefinition = {
      recurrenceType: 'FIXED_INTERVAL',
      intervalDays: 7,
      intervalMonths: 3,
    }
    expect(computeNextDue(def, { dueDate: d('2026-01-10T00:00:00Z') }).dueDate?.toISOString()).toBe(
      '2026-01-17T00:00:00.000Z',
    )
  })

  it('MILEAGE adds interval to completed mileage, no date', () => {
    const def: RecurrenceDefinition = { recurrenceType: 'MILEAGE', intervalKm: 10000 }
    expect(computeNextDue(def, { completedMileage: 8000 })).toEqual({
      dueDate: null,
      dueMileage: 18000,
    })
  })

  it('T14: computeNextDue is pure — it does not mutate its inputs', () => {
    const def: RecurrenceDefinition = { recurrenceType: 'FIXED_INTERVAL', intervalMonths: 12 }
    const prev: PreviousOccurrence = {
      dueDate: d('2026-01-10T00:00:00Z'),
      completedAt: d('2026-01-12T00:00:00Z'),
      completedMileage: 1000,
    }
    const snapshot = JSON.stringify(prev)
    computeNextDue(def, prev)
    expect(JSON.stringify(prev)).toBe(snapshot)
  })

  it('throws when a required field is missing (defensive)', () => {
    expect(() =>
      computeNextDue({ recurrenceType: 'FIXED_INTERVAL' }, { dueDate: d('2026-01-10T00:00:00Z') }),
    ).toThrow(/intervalMonths/)
    expect(() =>
      computeNextDue({ recurrenceType: 'FIXED_INTERVAL', intervalMonths: 12 }, {}),
    ).toThrow(/base date/)
  })
})

describe('addMonthsUTC', () => {
  it('preserves the day when the target month is long enough', () => {
    expect(addMonthsUTC(d('2026-03-15T00:00:00Z'), 2).toISOString()).toBe(
      '2026-05-15T00:00:00.000Z',
    )
  })
  it('wraps across year boundaries', () => {
    expect(addMonthsUTC(d('2026-11-10T00:00:00Z'), 3).toISOString()).toBe(
      '2027-02-10T00:00:00.000Z',
    )
  })
})

describe('nextSeasonalUTC', () => {
  it('uses the same year when the date is still ahead', () => {
    expect(nextSeasonalUTC(d('2026-01-05T00:00:00Z'), 3, 15).toISOString()).toBe(
      '2026-03-15T00:00:00.000Z',
    )
  })
  it('rolls to next year when the date has passed', () => {
    expect(nextSeasonalUTC(d('2026-04-05T00:00:00Z'), 3, 15).toISOString()).toBe(
      '2027-03-15T00:00:00.000Z',
    )
  })
})
