// Shared CarCare date/time formatting. All dates are shown in the reminder timezone
// (Europe/Bratislava), matching when notifications are actually sent, in a fixed
// DD/MM/YYYY (and DD/MM/YYYY HH:MM) format regardless of the viewer's locale/region.

const TZ = 'Europe/Bratislava'

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value == null) return null
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? null : d
}

function parts(d: Date, withTime: boolean) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' as const } : {}),
  })
  const map: Record<string, string> = {}
  for (const p of fmt.formatToParts(d)) map[p.type] = p.value
  return map
}

// DD/MM/YYYY in Europe/Bratislava.
export function formatDate(value: string | number | Date | null | undefined): string {
  const d = toDate(value)
  if (!d) return '—'
  const p = parts(d, false)
  return `${p.day}/${p.month}/${p.year}`
}

// DD/MM/YYYY HH:MM in Europe/Bratislava.
export function formatDateTime(value: string | number | Date | null | undefined): string {
  const d = toDate(value)
  if (!d) return '—'
  const p = parts(d, true)
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}
