import { Prisma, RecurrenceType, EventKind, ActionType } from '@prisma/client'
import { orgMemberIds } from './garage'

function humanize(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Default responsible person: an explicit choice wins; otherwise, when the org has exactly
// one person, prefill them automatically — there is no one else to assign it to.
async function defaultResponsibleUserId(
  tx: Prisma.TransactionClient,
  organizationId: string,
  explicit?: string | null,
): Promise<string | null> {
  if (explicit) return explicit
  const members = await orgMemberIds(tx, organizationId)
  return members.length === 1 ? members[0] : null
}

// Activate a catalogue template for a vehicle: creates a RecurringEvent (copying the
// template's recurrence/classification) and its first occurrence. Idempotent — a template
// already active on the vehicle is returned, not duplicated.
export async function activateTemplate(
  tx: Prisma.TransactionClient,
  params: {
    vehicleId: string
    templateKey: string
    name?: string
    dueDate?: Date | null
    dueMileage?: number | null
    responsibleUserId?: string | null
  },
) {
  const vehicle = await tx.myVehicle.findUnique({
    where: { id: params.vehicleId },
    select: { organizationId: true },
  })
  if (!vehicle) throw new Error(`vehicle not found: ${params.vehicleId}`)

  const template = await tx.eventTemplate.findUnique({ where: { key: params.templateKey } })
  if (!template) throw new Error(`template not found: ${params.templateKey}`)

  const existing = await tx.recurringEvent.findFirst({
    where: { vehicleId: params.vehicleId, templateId: template.id, deletedAt: null },
  })
  if (existing) return { event: existing, occurrence: null, created: false }

  const event = await tx.recurringEvent.create({
    data: {
      organizationId: vehicle.organizationId,
      vehicleId: params.vehicleId,
      templateId: template.id,
      name: params.name ?? humanize(template.key),
      category: template.category,
      kind: template.kind,
      actionType: template.actionType,
      recurrenceType: template.recurrenceType,
      intervalMonths: template.intervalMonths,
      intervalDays: template.intervalDays,
      intervalKm: template.intervalKm,
      seasonalMonth: template.seasonalMonth,
      seasonalDay: template.seasonalDay,
      responsibleUserId: await defaultResponsibleUserId(
        tx,
        vehicle.organizationId,
        params.responsibleUserId,
      ),
    },
  })
  const occurrence = await tx.eventOccurrence.create({
    data: {
      recurringEventId: event.id,
      vehicleId: params.vehicleId,
      sequenceNo: 1,
      status: 'UPCOMING',
      dueDate: params.dueDate ?? null,
      dueMileage: params.dueMileage ?? null,
    },
  })
  return { event, occurrence, created: true }
}

export interface CustomEventInput {
  name: string
  category: string
  kind?: EventKind
  actionType?: ActionType
  recurrenceType: RecurrenceType
  intervalMonths?: number | null
  intervalDays?: number | null
  intervalKm?: number | null
  seasonalMonth?: number | null
  seasonalDay?: number | null
  responsibleUserId?: string | null
  dueDate?: Date | null
  dueMileage?: number | null
}

// Create a fully custom event (no template) for a vehicle, plus its first occurrence.
export async function createCustomEvent(
  tx: Prisma.TransactionClient,
  vehicleId: string,
  input: CustomEventInput,
) {
  const vehicle = await tx.myVehicle.findUnique({
    where: { id: vehicleId },
    select: { organizationId: true },
  })
  if (!vehicle) throw new Error(`vehicle not found: ${vehicleId}`)

  const event = await tx.recurringEvent.create({
    data: {
      organizationId: vehicle.organizationId,
      vehicleId,
      templateId: null,
      name: input.name,
      category: input.category,
      kind: input.kind ?? 'RECOMMENDED',
      actionType: input.actionType ?? 'CUSTOM',
      recurrenceType: input.recurrenceType,
      intervalMonths: input.intervalMonths ?? null,
      intervalDays: input.intervalDays ?? null,
      intervalKm: input.intervalKm ?? null,
      seasonalMonth: input.seasonalMonth ?? null,
      seasonalDay: input.seasonalDay ?? null,
      responsibleUserId: await defaultResponsibleUserId(
        tx,
        vehicle.organizationId,
        input.responsibleUserId,
      ),
    },
  })
  const occurrence = await tx.eventOccurrence.create({
    data: {
      recurringEventId: event.id,
      vehicleId,
      sequenceNo: 1,
      status: 'UPCOMING',
      dueDate: input.dueDate ?? null,
      dueMileage: input.dueMileage ?? null,
    },
  })
  return { event, occurrence }
}
