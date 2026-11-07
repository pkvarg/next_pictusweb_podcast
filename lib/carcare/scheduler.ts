import { Prisma, NotificationStage, type PrismaClient, type Channel } from '@prisma/client'
import { addDaysUTC } from './recurrence'
import { resolveGarageOwner } from './garage'
import type { Channels } from './channels'

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
  // Responsible user, or the garage owner as fallback (FS owner fallback).
  const recipientUserId =
    def.responsibleUserId ?? (await resolveGarageOwner(tx, def.organizationId))
  if (!recipientUserId || !occ.dueDate) return [] // no recipient or no date to anchor on

  const recipient = await tx.user.findUnique({ where: { id: recipientUserId } })

  const created = []
  for (const stage of DUE_ANCHORED) {
    const rule = await resolveRule(tx, def.organizationId, def.id, stage)
    if (!rule) continue
    const when = applyQuietHours(
      scheduledFor(occ.dueDate, stage, rule.leadDays),
      recipient?.timezone ?? 'Europe/Bratislava',
      recipient?.quietHoursStart ?? null,
      recipient?.quietHoursEnd ?? null,
    )
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

// Channel eligibility: in-app is always allowed; email is on by default (or when opted in);
// SMS and push require explicit opt-in (consent).
export function isChannelAllowed(optIns: Channel[], channel: Channel): boolean {
  if (channel === 'IN_APP') return true
  if (channel === 'EMAIL') return optIns.length === 0 || optIns.includes('EMAIL')
  return optIns.includes(channel)
}

const MAX_ATTEMPTS = 5

// Dispatches due deliveries. Claims with FOR UPDATE SKIP LOCKED so overlapping ticks
// never send the same row twice (T11). Enforces channel opt-ins and the SMS monthly cap,
// and retries on send failure without ever touching the obligation (BR-12).
export async function dispatchDue(
  db: PrismaClient,
  channels: Channels,
  now: Date = new Date(),
  batch = 100,
) {
  const claimed = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    WITH due AS (
      SELECT id FROM notification_deliveries
      WHERE status = 'SCHEDULED' AND scheduled_for <= ${now}
      ORDER BY scheduled_for
      LIMIT ${batch}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE notification_deliveries d
    SET status = 'SENT', attempts = attempts + 1, updated_at = now()
    FROM due WHERE d.id = due.id
    RETURNING d.id
  `)

  let sent = 0
  let suppressed = 0
  let failed = 0

  for (const { id } of claimed) {
    const d = await db.notificationDelivery.findUnique({
      where: { id },
      include: { recipient: true, occurrence: { include: { recurringEvent: true } } },
    })
    if (!d) continue

    if (!isChannelAllowed(d.recipient.channelOptIns, d.channel)) {
      await db.notificationDelivery.update({
        where: { id },
        data: { status: 'SUPPRESSED', suppressedReason: 'channel not opted in' },
      })
      suppressed++
      continue
    }

    if (d.channel === 'SMS' && d.recipient.smsSentThisMonth >= d.recipient.smsMonthlyLimit) {
      await db.notificationDelivery.update({
        where: { id },
        data: { status: 'SUPPRESSED', suppressedReason: 'sms monthly limit reached' },
      })
      suppressed++
      continue
    }

    try {
      await channels[d.channel](d)
      await db.notificationDelivery.update({ where: { id }, data: { sentAt: now } })
      if (d.channel === 'SMS') {
        await db.user.update({
          where: { id: d.recipientUserId },
          data: { smsSentThisMonth: { increment: 1 } },
        })
      }
      sent++
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const retry = d.attempts < MAX_ATTEMPTS
      await db.notificationDelivery.update({
        where: { id },
        data: { status: retry ? 'SCHEDULED' : 'FAILED', lastError: msg },
      })
      failed++
    }
  }

  return { claimed: claimed.length, sent, suppressed, failed }
}

// Returns the local hour (0-23) of a UTC instant in the given IANA timezone.
function localHour(d: Date, timeZone: string): number {
  const s = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(d)
  return Number(s) % 24
}

function inQuiet(hour: number, start: number, end: number): boolean {
  return start < end ? hour >= start && hour < end : hour >= start || hour < end
}

// Shifts a send time out of the recipient's quiet-hours window to the first allowed hour.
// Steps forward one hour at a time (quiet windows are short); DST within the window is
// an acceptable MVP imprecision. Returns the input unchanged when quiet hours are unset.
export function applyQuietHours(
  when: Date,
  timeZone: string,
  startHour: number | null,
  endHour: number | null,
): Date {
  if (startHour == null || endHour == null || startHour === endHour) return when
  let d = when
  for (let i = 0; i < 24; i++) {
    if (!inQuiet(localHour(d, timeZone), startHour, endHour)) return d
    d = new Date(d.getTime() + 60 * 60 * 1000)
  }
  return d
}

// BR-06: completing (or cancelling/skipping) an occurrence suppresses all its remaining
// scheduled reminders across every stage and channel.
export async function cancelAllDeliveries(
  tx: Prisma.TransactionClient,
  occurrenceId: string,
  reason: string,
) {
  await tx.notificationDelivery.updateMany({
    where: { occurrenceId, status: 'SCHEDULED' },
    data: { status: 'SUPPRESSED', suppressedReason: reason },
  })
}

// FS-704 / BR-07/08: move responsibility to another user. Scheduled reminders addressed to
// the previous responsible user are suppressed, and the planner re-targets future ones.
export async function reassignResponsibleUser(
  tx: Prisma.TransactionClient,
  recurringEventId: string,
  newResponsibleUserId: string,
) {
  const def = await tx.recurringEvent.findUnique({ where: { id: recurringEventId } })
  if (!def) throw new Error(`recurring event not found: ${recurringEventId}`)
  const previous = def.responsibleUserId

  await tx.recurringEvent.update({
    where: { id: recurringEventId },
    data: { responsibleUserId: newResponsibleUserId },
  })

  const openOccurrences = await tx.eventOccurrence.findMany({
    where: {
      recurringEventId,
      status: { in: ['UPCOMING', 'ACTION_REQUIRED', 'ARRANGED'] },
    },
    select: { id: true },
  })

  for (const occ of openOccurrences) {
    if (previous) {
      await tx.notificationDelivery.updateMany({
        where: { occurrenceId: occ.id, recipientUserId: previous, status: 'SCHEDULED' },
        data: { status: 'SUPPRESSED', suppressedReason: 'responsibility reassigned' },
      })
    }
    await planDeliveries(tx, occ.id)
  }
}
