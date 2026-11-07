export type RecurrenceType =
  | 'ONE_TIME'
  | 'FIXED_INTERVAL'
  | 'AFTER_COMPLETION'
  | 'SEASONAL'
  | 'MILEAGE'
  | 'DATE_OR_MILEAGE'

export interface RecurrenceDefinition {
  recurrenceType: RecurrenceType
  intervalMonths?: number | null
  intervalDays?: number | null
  intervalKm?: number | null
  seasonalMonth?: number | null
  seasonalDay?: number | null
}

export interface PreviousOccurrence {
  dueDate?: Date | null
  completedAt?: Date | null
  completedMileage?: number | null
}

export interface DueResult {
  dueDate: Date | null
  dueMileage: number | null
}

function daysInMonthUTC(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate()
}

export function addMonthsUTC(base: Date, months: number): Date {
  const totalMonths = base.getUTCMonth() + months
  const targetYear = base.getUTCFullYear() + Math.floor(totalMonths / 12)
  const targetMonth = ((totalMonths % 12) + 12) % 12
  const day = Math.min(base.getUTCDate(), daysInMonthUTC(targetYear, targetMonth))
  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      day,
      base.getUTCHours(),
      base.getUTCMinutes(),
      base.getUTCSeconds(),
      base.getUTCMilliseconds(),
    ),
  )
}

export function addDaysUTC(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
}

// For interval-based recurrence: prefer an explicit day interval (e.g. "every 2 weeks"),
// otherwise fall back to the month interval. Requires one of them.
function advanceInterval(base: Date, def: RecurrenceDefinition): Date {
  if (def.intervalDays != null) return addDaysUTC(base, def.intervalDays)
  return addMonthsUTC(base, requireNum(def.intervalMonths, 'intervalMonths or intervalDays'))
}

export function nextSeasonalUTC(from: Date, month: number, day: number): Date {
  let d = new Date(Date.UTC(from.getUTCFullYear(), month - 1, day))
  if (d.getTime() <= from.getTime()) {
    d = new Date(Date.UTC(from.getUTCFullYear() + 1, month - 1, day))
  }
  return d
}

function requireDate(d: Date | null | undefined, field: string): Date {
  if (!d) throw new Error(`recurrence: missing ${field}`)
  return d
}

function requireNum(n: number | null | undefined, field: string): number {
  if (n == null) throw new Error(`recurrence: missing ${field}`)
  return n
}

export function computeNextDue(def: RecurrenceDefinition, prev: PreviousOccurrence): DueResult {
  const base =
    def.recurrenceType === 'AFTER_COMPLETION'
      ? (prev.completedAt ?? prev.dueDate)
      : (prev.dueDate ?? prev.completedAt)

  const prevMileage = prev.completedMileage ?? 0

  switch (def.recurrenceType) {
    case 'ONE_TIME':
      return { dueDate: null, dueMileage: null }

    case 'FIXED_INTERVAL':
    case 'AFTER_COMPLETION':
      return {
        dueDate: advanceInterval(requireDate(base, 'base date'), def),
        dueMileage: null,
      }

    case 'SEASONAL':
      return {
        dueDate: nextSeasonalUTC(
          requireDate(base, 'base date'),
          requireNum(def.seasonalMonth, 'seasonalMonth'),
          requireNum(def.seasonalDay, 'seasonalDay'),
        ),
        dueMileage: null,
      }

    case 'MILEAGE':
      return { dueDate: null, dueMileage: prevMileage + requireNum(def.intervalKm, 'intervalKm') }

    case 'DATE_OR_MILEAGE':
      return {
        dueDate: advanceInterval(requireDate(base, 'base date'), def),
        dueMileage: prevMileage + requireNum(def.intervalKm, 'intervalKm'),
      }
  }
}
