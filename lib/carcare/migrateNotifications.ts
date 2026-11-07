import { PrismaClient } from '@prisma/client'
import { addMonthsUTC, nextSeasonalUTC } from './recurrence'
import { resolveGarageOwner } from './garage'

type EventMap = {
  name: string
  category: string
  kind: 'LEGAL' | 'RECOMMENDED'
  actionType: 'BOOK' | 'RENEW' | 'PAY' | 'PURCHASE' | 'INSPECT' | 'CUSTOM'
  recurrenceType: 'ONE_TIME' | 'FIXED_INTERVAL' | 'SEASONAL'
  intervalMonths?: number
  seasonalMonth?: number
  seasonalDay?: number
}

// Legacy free-text notificationType -> a custom RecurringEvent definition.
const TYPE_MAP: Record<string, EventMap> = {
  'STK/EK': {
    name: 'STK/EK',
    category: 'inspection',
    kind: 'LEGAL',
    actionType: 'INSPECT',
    recurrenceType: 'FIXED_INTERVAL',
    intervalMonths: 24,
  },
  Kontrola: {
    name: 'Kontrola',
    category: 'service',
    kind: 'RECOMMENDED',
    actionType: 'BOOK',
    recurrenceType: 'FIXED_INTERVAL',
    intervalMonths: 12,
  },
  'Technický preukaz platnosť': {
    name: 'Technický preukaz platnosť',
    category: 'permit',
    kind: 'LEGAL',
    actionType: 'RENEW',
    recurrenceType: 'ONE_TIME',
  },
  'Výmena oleja': {
    name: 'Výmena oleja',
    category: 'service',
    kind: 'RECOMMENDED',
    actionType: 'BOOK',
    recurrenceType: 'FIXED_INTERVAL',
    intervalMonths: 12,
  },
  'Dialnicna znamka SK': {
    name: 'Diaľničná známka',
    category: 'vignette',
    kind: 'LEGAL',
    actionType: 'PURCHASE',
    recurrenceType: 'FIXED_INTERVAL',
    intervalMonths: 12,
  },
  Poistenie: {
    name: 'PZP – povinné zmluvné poistenie',
    category: 'insurance',
    kind: 'LEGAL',
    actionType: 'RENEW',
    recurrenceType: 'FIXED_INTERVAL',
    intervalMonths: 12,
  },
  'Pneu leto': {
    name: 'Prezutie na letné pneumatiky',
    category: 'tyres',
    kind: 'RECOMMENDED',
    actionType: 'BOOK',
    recurrenceType: 'SEASONAL',
    seasonalMonth: 4,
    seasonalDay: 1,
  },
  'Pneu zima': {
    name: 'Prezutie na zimné pneumatiky',
    category: 'tyres',
    kind: 'RECOMMENDED',
    actionType: 'BOOK',
    recurrenceType: 'SEASONAL',
    seasonalMonth: 11,
    seasonalDay: 1,
  },
}

function dueDateFor(map: EventMap, base: Date | null, today: Date): Date {
  if (map.recurrenceType === 'SEASONAL') {
    return nextSeasonalUTC(today, map.seasonalMonth!, map.seasonalDay!)
  }
  const anchor = base ?? today
  if (map.recurrenceType === 'ONE_TIME') return anchor
  let d = anchor
  let guard = 0
  while (d < today && guard < 200) {
    d = addMonthsUTC(d, map.intervalMonths!)
    guard++
  }
  return d
}

export interface MigrationSummary {
  dryRun: boolean
  vehiclesCreated: number
  vehiclesReused: number
  eventsCreated: number
  eventsSkipped: number
  occurrencesCreated: number
  rowsConsidered: number
  rowsSkipped: number
  byEvent: Record<string, number>
}

// Convert legacy vehicle_notifications into CarCare vehicles + recurring events +
// one upcoming occurrence each. Idempotent: existing vehicles (by org+registration
// or my_vehicle_id) are reused and existing events (by vehicle+name) are skipped.
export async function migrateVehicleNotifications(
  prisma: PrismaClient,
  opts: { dryRun?: boolean } = {},
): Promise<MigrationSummary> {
  const dryRun = opts.dryRun ?? false
  const today = new Date()
  const summary: MigrationSummary = {
    dryRun,
    vehiclesCreated: 0,
    vehiclesReused: 0,
    eventsCreated: 0,
    eventsSkipped: 0,
    occurrencesCreated: 0,
    rowsConsidered: 0,
    rowsSkipped: 0,
    byEvent: {},
  }

  const rows = await prisma.vehicleNotification.findMany({
    where: { deletedAt: null, organizationId: { not: null } },
    orderBy: { createdAt: 'asc' },
  })

  type Row = (typeof rows)[number]
  const vehicleGroups = new Map<string, Row[]>()
  for (const r of rows) {
    summary.rowsConsidered++
    const type = r.notificationType?.trim()
    if (!type || !TYPE_MAP[type]) {
      summary.rowsSkipped++
      continue
    }
    const reg = r.vehicleRegistration?.trim()
    if (!reg && !r.myVehicleId) {
      summary.rowsSkipped++
      continue
    }
    const key = r.myVehicleId ?? `${r.organizationId}::${reg!.toUpperCase()}`
    const list = vehicleGroups.get(key) ?? []
    list.push(r)
    vehicleGroups.set(key, list)
  }

  for (const [, groupRows] of vehicleGroups) {
    const first = groupRows[0]
    const organizationId = first.organizationId!
    const registration = (first.vehicleRegistration?.trim() || 'NEZNÁME').slice(0, 20)

    let vehicleId: string | null = first.myVehicleId ?? null
    if (vehicleId) {
      const exists = await prisma.myVehicle.findFirst({
        where: { id: vehicleId, deletedAt: null },
        select: { id: true },
      })
      if (!exists) vehicleId = null
    }
    if (!vehicleId) {
      const existing = await prisma.myVehicle.findFirst({
        where: { organizationId, registration, deletedAt: null },
        select: { id: true },
      })
      if (existing) {
        vehicleId = existing.id
        summary.vehiclesReused++
      }
    }
    if (!vehicleId) {
      const ownerUserId =
        groupRows.find((r) => r.userId)?.userId ??
        (await resolveGarageOwner(prisma, organizationId))
      if (!ownerUserId) {
        summary.rowsSkipped += groupRows.length
        continue
      }
      if (dryRun) {
        summary.vehiclesCreated++
        vehicleId = `dry-${registration}`
      } else {
        const created = await prisma.myVehicle.create({
          data: {
            organizationId,
            userId: ownerUserId,
            type: registration,
            registration,
            nickname: groupRows.find((r) => r.personName)?.personName?.slice(0, 100) ?? null,
          },
          select: { id: true },
        })
        vehicleId = created.id
        summary.vehiclesCreated++
      }
    }

    const byType = new Map<string, Row[]>()
    for (const r of groupRows) {
      const t = r.notificationType!.trim()
      const list = byType.get(t) ?? []
      list.push(r)
      byType.set(t, list)
    }

    for (const [type, typeRows] of byType) {
      const map = TYPE_MAP[type]
      if (!dryRun) {
        const existingEvent = await prisma.recurringEvent.findFirst({
          where: { vehicleId, name: map.name, deletedAt: null },
          select: { id: true },
        })
        if (existingEvent) {
          summary.eventsSkipped++
          continue
        }
      }

      const latest = typeRows.reduce((a, b) => {
        const ad = a.dutyDate?.getTime() ?? a.createdAt.getTime()
        const bd = b.dutyDate?.getTime() ?? b.createdAt.getTime()
        return bd > ad ? b : a
      })
      const base = latest.dutyDate ?? latest.createdAt ?? null
      const dueDate = dueDateFor(map, base, today)

      summary.byEvent[map.name] = (summary.byEvent[map.name] ?? 0) + 1
      summary.eventsCreated++
      summary.occurrencesCreated++

      if (dryRun) continue

      const event = await prisma.recurringEvent.create({
        data: {
          organizationId,
          vehicleId,
          name: map.name,
          category: map.category,
          kind: map.kind,
          actionType: map.actionType,
          recurrenceType: map.recurrenceType,
          intervalMonths: map.intervalMonths ?? null,
          seasonalMonth: map.seasonalMonth ?? null,
          seasonalDay: map.seasonalDay ?? null,
          currency: 'EUR',
        },
        select: { id: true },
      })
      await prisma.eventOccurrence.create({
        data: {
          recurringEventId: event.id,
          vehicleId,
          sequenceNo: 1,
          status: 'UPCOMING',
          dueDate,
        },
      })
    }
  }

  return summary
}
