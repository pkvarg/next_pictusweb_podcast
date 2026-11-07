import { Prisma, NotificationStage } from '@prisma/client'
import { addDaysUTC } from './recurrence'

export const BOOKING_STAGES: NotificationStage[] = [
  NotificationStage.PREPARATION,
  NotificationStage.BOOKING,
  NotificationStage.BOOKING_FOLLOWUP,
]

// Stages the planner can schedule from the occurrence due date in this milestone.
// APPOINTMENT / COMPLETION / LOGGING anchor on appointment/completion and are added in M9.
const DUE_ANCHORED: NotificationStage[] = [
  NotificationStage.PREPARATION,
  NotificationStage.BOOKING,
  NotificationStage.BOOKING_FOLLOWUP,
  NotificationStage.DEADLINE,
  NotificationStage.OVERDUE,
]

// Event-specific rule wins over the org-wide default (recurringEventId = null) for a stage.
async function resolveRule(
  tx: Prisma.TransactionClient,
  organizationId: string,
  recurringEventId: string,
  stage: NotificationStage,
) {
  const override = await tx.notificationRule.findFirst({
    where: { organizationId, recurringEventId, stage, active: true },
  })
  if (override) return override
  return tx.notificationRule.findFirst({
    where: { organizationId, recurringEventId: null, stage, active: true },
  })
}

function scheduledFor(dueDate: Date, stage: NotificationStage, leadDays: number): Date {
  // OVERDUE fires leadDays AFTER the deadline; every other stage leadDays BEFORE it.
  return stage === NotificationStage.OVERDUE
    ? addDaysUTC(dueDate, leadDays)
    : addDaysUTC(dueDate, -leadDays)
}

// Materializes the notification_deliveries for an occurrence from its rules.
// Idempotent: the deterministic dedupe_key means re-running never double-creates,
// and it never resurrects a SUPPRESSED/SENT/CANCELLED row (upsert update:{}).
export async function planDeliveries(tx: Prisma.TransactionClient, occurrenceId: string) {
  const occ = await tx.eventOccurrence.findUnique({
    where: { id: occurrenceId },
    include: { recurringEvent: true },
  })
  if (!occ) throw new Error(`occurrence not found: ${occurrenceId}`)
  if (occ.status === 'COMPLETED' || occ.status === 'CANCELLED' || occ.status === 'SKIPPED')
    return []

  const def = occ.recurringEvent
  const recipientUserId = def.responsibleUserId
  if (!recipientUserId || !occ.dueDate) return [] // no recipient or no date to anchor on

  const created = []
  for (const stage of DUE_ANCHORED) {
    const rule = await resolveRule(tx, def.organizationId, def.id, stage)
    if (!rule) continue
    const when = scheduledFor(occ.dueDate, stage, rule.leadDays)
    for (const channel of rule.channels) {
      const dedupeKey = `${occ.id}:${stage}:${channel}:${recipientUserId}:0`
      const row = await tx.notificationDelivery.upsert({
        where: { dedupeKey },
        create: {
          occurrenceId: occ.id,
          recurringEventId: def.id,
          stage,
          channel,
          recipientUserId,
          scheduledFor: when,
          status: 'SCHEDULED',
          dedupeKey,
        },
        update: {},
      })
      created.push(row)
    }
  }
  return created
}

// Suppress SCHEDULED deliveries for the given stages (never touches SENT/already-SUPPRESSED).
export async function cancelDeliveries(
  tx: Prisma.TransactionClient,
  occurrenceId: string,
  stages: NotificationStage[],
  reason: string,
) {
  await tx.notificationDelivery.updateMany({
    where: { occurrenceId, stage: { in: stages }, status: 'SCHEDULED' },
    data: { status: 'SUPPRESSED', suppressedReason: reason },
  })
}

// BR-04: a confirmed booking stops the "book this" reminders across channels.
export async function suppressBookingReminders(tx: Prisma.TransactionClient, occurrenceId: string) {
  await cancelDeliveries(tx, occurrenceId, BOOKING_STAGES, 'appointment booked')
}

// BR-05: an appointment cancelled while the obligation is still open re-activates the
// booking reminders that were suppressed when it was booked.
export async function reactivateBookingReminders(
  tx: Prisma.TransactionClient,
  occurrenceId: string,
) {
  await tx.notificationDelivery.updateMany({
    where: { occurrenceId, stage: { in: BOOKING_STAGES }, status: 'SUPPRESSED' },
    data: { status: 'SCHEDULED', suppressedReason: null },
  })
}

// In-app notification centre: the deliveries addressed to a user on the IN_APP channel.
export async function listInAppNotifications(
  tx: Prisma.TransactionClient,
  recipientUserId: string,
) {
  return tx.notificationDelivery.findMany({
    where: { recipientUserId, channel: 'IN_APP', status: { in: ['SCHEDULED', 'SENT'] } },
    orderBy: { scheduledFor: 'asc' },
  })
}
