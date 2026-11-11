import { Prisma, NotificationStage, type PrismaClient, type Channel } from '@prisma/client'
import { addDaysUTC } from './recurrence'
import { resolveGarageOwner } from './garage'
import { checkNotificationLimit } from '@/lib/notificationLimits'
import { smsAllowedForTier } from './limits'
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

// Timezone reminders are anchored to (the garage's locale).
const SEND_TZ = 'Europe/Bratislava'

// Offset of `tz` from UTC, in minutes, at the given instant (handles DST).
function tzOffsetMinutes(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const p: Record<string, string> = {}
  for (const x of parts) p[x.type] = x.value
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second)
  return (asUTC - date.getTime()) / 60000
}

// Returns the UTC instant for `hour:minute` local time in `tz`, on the calendar date of `day`
// (day's UTC date components). Used to send reminders at the account's chosen wall-clock time.
function atLocalTime(day: Date, hour: number, minute: number, tz: string): Date {
  const guess = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute, 0),
  )
  const offset = tzOffsetMinutes(guess, tz)
  return new Date(guess.getTime() - offset * 60000)
}

// Effective recipients for an event's notifications:
//   - central recipient list (NotificationRecipient) ∪ the event's responsible person,
//     minus the event's per-event exclusions (EventRecipientExclusion);
//   - when no central list is configured, the pre-multi-recipient behaviour: the
//     responsible person, or the garage owner as fallback (still honouring exclusions).
export async function resolveRecipients(
  tx: Prisma.TransactionClient,
  def: { id: string; organizationId: string; responsibleUserId: string | null },
): Promise<string[]> {
  const [central, exclusionRows] = await Promise.all([
    tx.notificationRecipient.findMany({
      where: { organizationId: def.organizationId },
      select: { userId: true },
    }),
    tx.eventRecipientExclusion.findMany({
      where: { recurringEventId: def.id },
      select: { userId: true },
    }),
  ])
  const excluded = new Set(exclusionRows.map((e) => e.userId))

  if (central.length === 0) {
    const fallback = def.responsibleUserId ?? (await resolveGarageOwner(tx, def.organizationId))
    if (!fallback || excluded.has(fallback)) return []
    return [fallback]
  }

  const set = new Set(central.map((c) => c.userId))
  if (def.responsibleUserId) set.add(def.responsibleUserId)
  return [...set].filter((id) => !excluded.has(id))
}

const MAX_REPEAT_INSTANCES = 8
const OVERDUE_REPEAT_HORIZON_DAYS = 30

// The send days for a stage: a single day by default, or a repeating series (every
// repeatEveryDays) when the rule opts in — the "repeat until actioned" setting.
// Before-deadline stages repeat up to the due date; OVERDUE repeats forward past it.
// A booked appointment (BOOKING_STAGES) or a completion stops the series by suppressing
// the remaining SCHEDULED rows, so the horizon here is only an upper bound.
function repeatInstances(
  stage: NotificationStage,
  base: Date,
  dueDate: Date,
  rule: { repeatUntilActioned: boolean; repeatEveryDays: number | null },
): Date[] {
  if (!rule.repeatUntilActioned || !rule.repeatEveryDays || rule.repeatEveryDays < 1) {
    return [base]
  }
  const step = Math.round(rule.repeatEveryDays)
  const end =
    stage === NotificationStage.OVERDUE ? addDaysUTC(dueDate, OVERDUE_REPEAT_HORIZON_DAYS) : dueDate
  const out: Date[] = []
  for (
    let d = base;
    d.getTime() <= end.getTime() && out.length < MAX_REPEAT_INSTANCES;
    d = addDaysUTC(d, step)
  ) {
    out.push(d)
  }
  return out.length > 0 ? out : [base]
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
  if (!occ.dueDate) return [] // no date to anchor on

  const recipientIds = await resolveRecipients(tx, def)
  if (recipientIds.length === 0) return [] // no one to notify

  // Account-level send time: reminders go out at this wall-clock time (SEND_TZ) on the
  // target day, instead of at the due date's midnight. Minute is 0 or 30.
  const org = await tx.organization.findUnique({
    where: { id: def.organizationId },
    select: {
      notificationSendHour: true,
      notificationSendMinute: true,
      tierRelation: { select: { name: true } },
    },
  })
  const sendHour = org?.notificationSendHour ?? 8
  const sendMinute = org?.notificationSendMinute ?? 30
  const canSms = smsAllowedForTier(org?.tierRelation?.name)

  const now = new Date()
  const created = []
  for (const stage of DUE_ANCHORED) {
    const rule = await resolveRule(tx, def.organizationId, def.id, stage)
    if (!rule) continue
    // A booked appointment stops the "arrange it" nags (BR-04); don't re-create them.
    if (BOOKING_STAGES.includes(stage) && occ.status === 'ARRANGED') continue
    const base = scheduledFor(occ.dueDate, stage, rule.leadDays)
    const instants = repeatInstances(stage, base, occ.dueDate, rule)
    for (let i = 0; i < instants.length; i++) {
      const when = atLocalTime(instants[i], sendHour, sendMinute, SEND_TZ)
      // The primary reminder (i=0) always materializes, but never backfill a repeat
      // instance whose time already passed — enabling repeat must not dump a catch-up
      // burst of historical reminders.
      if (i > 0 && when.getTime() < now.getTime()) continue
      for (const recipientUserId of recipientIds) {
        for (const channel of rule.channels) {
          if (channel === 'SMS' && !canSms) continue // SMS is a paid-plan channel
          const dedupeKey = `${occ.id}:${stage}:${channel}:${recipientUserId}:${i}`
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
    }
  }
  return created
}

// Appointment-anchored reminder (NotificationStage.APPOINTMENT). Unlike the due-anchored
// stages this is scheduled relative to the booked appointment time, so it is planned when
// an appointment is booked/rescheduled rather than by the due-date planner. Re-arming
// (update path) lets a reschedule move the reminder, and a later booking re-send it.
export async function planAppointmentReminder(
  tx: Prisma.TransactionClient,
  occurrenceId: string,
  scheduledAt: Date,
) {
  const occ = await tx.eventOccurrence.findUnique({
    where: { id: occurrenceId },
    include: { recurringEvent: true },
  })
  if (!occ) throw new Error(`occurrence not found: ${occurrenceId}`)
  const def = occ.recurringEvent

  const rule = await resolveRule(tx, def.organizationId, def.id, NotificationStage.APPOINTMENT)
  if (!rule) return []

  const recipientIds = await resolveRecipients(tx, def)
  if (recipientIds.length === 0) return []

  const org = await tx.organization.findUnique({
    where: { id: def.organizationId },
    select: {
      notificationSendHour: true,
      notificationSendMinute: true,
      tierRelation: { select: { name: true } },
    },
  })
  const sendHour = org?.notificationSendHour ?? 8
  const sendMinute = org?.notificationSendMinute ?? 30
  const canSms = smsAllowedForTier(org?.tierRelation?.name)
  const when = atLocalTime(addDaysUTC(scheduledAt, -rule.leadDays), sendHour, sendMinute, SEND_TZ)

  const created = []
  for (const recipientUserId of recipientIds) {
    for (const channel of rule.channels) {
      if (channel === 'SMS' && !canSms) continue // SMS is a paid-plan channel
      const dedupeKey = `${occ.id}:${NotificationStage.APPOINTMENT}:${channel}:${recipientUserId}:0`
      const row = await tx.notificationDelivery.upsert({
        where: { dedupeKey },
        create: {
          occurrenceId: occ.id,
          recurringEventId: def.id,
          stage: NotificationStage.APPOINTMENT,
          channel,
          recipientUserId,
          scheduledFor: when,
          status: 'SCHEDULED',
          dedupeKey,
        },
        update: { scheduledFor: when, status: 'SCHEDULED', suppressedReason: null },
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
    where: { recipientUserId, channel: 'IN_APP', status: { in: ['SCHEDULED', 'SENDING', 'SENT'] } },
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
// A delivery stuck in 'SENDING' longer than this was claimed by a run that died before the
// channel confirmed; the next dispatch re-queues it. Must exceed a normal dispatch batch.
const STALE_SENDING_MS = 15 * 60 * 1000

// Dispatches due deliveries. Claims with FOR UPDATE SKIP LOCKED so overlapping ticks
// never send the same row twice (T11). Enforces channel opt-ins and the SMS monthly cap,
// and retries on send failure without ever touching the obligation (BR-12).
export async function dispatchDue(
  db: PrismaClient,
  channels: Channels,
  now: Date = new Date(),
  batch = 100,
) {
  // Crash recovery: a delivery left 'SENDING' beyond the stale window belongs to a run that
  // claimed it but died before the channel confirmed — re-queue it so this run retries it.
  await db.$executeRaw(Prisma.sql`
    UPDATE notification_deliveries
    SET status = 'SCHEDULED', updated_at = now()
    WHERE status = 'SENDING' AND updated_at < ${new Date(now.getTime() - STALE_SENDING_MS)}
  `)

  // Claim due rows into the transient 'SENDING' state (NOT 'SENT') so a crash between the
  // claim and the actual send never silently marks a reminder as delivered.
  const claimed = await db.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    WITH due AS (
      SELECT id FROM notification_deliveries
      WHERE status = 'SCHEDULED' AND scheduled_for <= ${now}
      ORDER BY scheduled_for
      LIMIT ${batch}
      FOR UPDATE SKIP LOCKED
    )
    UPDATE notification_deliveries d
    SET status = 'SENDING', attempts = attempts + 1, updated_at = now()
    FROM due WHERE d.id = due.id
    RETURNING d.id
  `)

  let sent = 0
  let suppressed = 0
  let failed = 0

  for (const { id } of claimed) {
    const d = await db.notificationDelivery.findUnique({
      where: { id },
      include: {
        recipient: true,
        occurrence: {
          include: {
            recurringEvent: {
              include: {
                organization: {
                  select: {
                    notificationLocale: true,
                    notificationsBlocked: true,
                    deletedAt: true,
                    tierRelation: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (!d) continue

    // Never send EMAIL/SMS for a blocked (billing/quota) or deleted organization.
    const org = d.occurrence.recurringEvent.organization
    if (
      (d.channel === 'EMAIL' || d.channel === 'SMS') &&
      (org.notificationsBlocked || org.deletedAt)
    ) {
      await db.notificationDelivery.update({
        where: { id },
        data: {
          status: 'SUPPRESSED',
          suppressedReason: org.deletedAt ? 'organization deleted' : 'notifications blocked',
        },
      })
      suppressed++
      continue
    }

    if (!isChannelAllowed(d.recipient.channelOptIns, d.channel)) {
      await db.notificationDelivery.update({
        where: { id },
        data: { status: 'SUPPRESSED', suppressedReason: 'channel not opted in' },
      })
      suppressed++
      continue
    }

    if (d.channel === 'SMS' && !smsAllowedForTier(org.tierRelation?.name)) {
      await db.notificationDelivery.update({
        where: { id },
        data: { status: 'SUPPRESSED', suppressedReason: 'sms not in plan' },
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

    // Tier notification quota. One reminder bills once: SMS when the reminder uses SMS,
    // otherwise EMAIL (PUSH / IN_APP never count). checkNotificationLimit enforces the
    // tier limit (FREE soft-deletes the org, paid blocks with a yearly reset).
    const organizationId = d.occurrence.recurringEvent.organizationId
    const metered =
      d.channel === 'SMS' ||
      (d.channel === 'EMAIL' &&
        (await db.notificationDelivery.count({
          where: {
            occurrenceId: d.occurrenceId,
            stage: d.stage,
            recipientUserId: d.recipientUserId,
            channel: 'SMS',
          },
        })) === 0)

    if (metered) {
      const check = await checkNotificationLimit(
        organizationId,
        1,
        d.recipient.email ?? undefined,
        org.notificationLocale,
      )
      if (!check.allowed) {
        await db.notificationDelivery.update({
          where: { id },
          data: { status: 'SUPPRESSED', suppressedReason: 'notification limit reached' },
        })
        suppressed++
        continue
      }
    }

    try {
      await channels[d.channel](d)
      await db.notificationDelivery.update({
        where: { id },
        data: { status: 'SENT', sentAt: now },
      })
      if (d.channel === 'SMS') {
        await db.user.update({
          where: { id: d.recipientUserId },
          data: { smsSentThisMonth: { increment: 1 } },
        })
      }
      if (metered) {
        await db.organization.update({
          where: { id: organizationId },
          data: { currentNotificationsCount: { increment: 1 } },
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
