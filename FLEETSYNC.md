# FleetSync — how it works

FleetSync (internally **CarCare**, the v5 rebuild) is a fleet maintenance-reminder
platform: organizations register vehicles, attach recurring maintenance/compliance
events (STK, oil change, insurance, …), and the system reminds the responsible people
to book and complete each one, then regenerates the next cycle.

This document describes the **current** engine (branch `main-cC`). The pre-v5 system
(the `vehiclenotification` table + n8n `Today_pdr`/`Reminders_pdr`/`Aggressive_mode`
workflows + notification templates) is legacy and being replaced by what follows.

---

## 1. Domain model

- **MyVehicle** (`my_vehicles`) — a vehicle in an org's garage.
- **RecurringEvent** (`recurring_events`) — a maintenance obligation on a vehicle
  (category, recurrence rule, responsible person). Recurrence: `FIXED_INTERVAL`
  (months/days), `MILEAGE`, `SEASONAL`, or `ONE_TIME`.
- **EventOccurrence** (`event_occurrences`) — one concrete instance of an event with a
  `dueDate` (and/or `dueMileage`). Completing one spawns the next.
- **Appointment** (`appointments`) — a booked visit for an occurrence; its `scheduledAt`
  is independent of the occurrence's due date.
- **NotificationRule** (`notification_rules`) — per stage: lead days, channels, repeat
  settings. Scoped org-wide (`recurringEventId = null`, the central defaults) or
  per-event (override).
- **NotificationDelivery** (`notification_deliveries`) — one queued/sent message
  (occurrence × stage × channel × recipient). The unit the dispatcher works on, and the
  row that backs the in-app bell.
- **NotificationRecipient** (`notification_recipients`) — the org's central recipient
  list. **EventRecipientExclusion** — per-event opt-outs.
- **GarageMembership** / **GarageInvitation** — members and pending invites with roles
  `OWNER` / `ADMIN` / `MEMBER` / `VIEWER`.

## 2. Occurrence lifecycle

```
UPCOMING ──book appointment──▶ ARRANGED ──complete──▶ COMPLETED ──▶ (next occurrence UPCOMING)
   │                              │
   │ cancel appointment ◀─────────┘
   ▼
ACTION_REQUIRED
```

- **Book** (`bookAppointment`) → occurrence `ARRANGED`; the "arrange it" reminders
  (PREPARATION/BOOKING/BOOKING_FOLLOWUP) are suppressed (BR-04); an APPOINTMENT reminder
  is scheduled for the visit.
- **Cancel appointment** (`cancelAppointment`) → back to `ACTION_REQUIRED`; booking
  reminders reactivated (BR-05); the APPOINTMENT reminder dropped.
- **Complete** (`completeOccurrence`) → `COMPLETED`; **all** remaining reminders
  suppressed (BR-06); the next occurrence is generated from the recurrence rule.
- The due date is never changed by booking/rescheduling (BR-01).

## 3. Reminder stages

Stages exist for `PREPARATION, BOOKING, BOOKING_FOLLOWUP, APPOINTMENT, DEADLINE,
OVERDUE, COMPLETION, LOGGING`. What the engine actually schedules today:

| Stage                         | Anchor                  | Sent when                                     |
| ----------------------------- | ----------------------- | --------------------------------------------- |
| BOOKING                       | due date − leadDays     | default lead 14d — "time to book"             |
| DEADLINE                      | due date − leadDays     | default lead 3d — "deadline approaching"      |
| OVERDUE                       | due date + leadDays     | default lead 0 — "overdue"                    |
| APPOINTMENT                   | booked visit − leadDays | default lead 1d — only once a visit is booked |
| PREPARATION, BOOKING_FOLLOWUP | due-anchored            | only if a rule is configured (no default)     |
| COMPLETION, LOGGING           | —                       | not scheduled by the engine yet               |

Each stage fans out to the channels on its rule. All reminders go out at the org's
**send time** on their day (see §5).

## 4. Channels & consent

`isChannelAllowed(optIns, channel)` (`lib/carcare/scheduler.ts`) — **not tier-based**:

- **IN_APP** — always on. It's just the delivery row, surfaced in the bell. Free.
- **EMAIL** — on by default (sent unless the recipient has an opt-in list that excludes it).
- **SMS** — requires the recipient to opt in; number must be E.164 (`lib/phone.ts`
  normalizes on every write); respects a per-user monthly cap.
- **PUSH** — web-push/VAPID; requires the recipient's browser to subscribe (the Garage
  → "this device" toggle), which records a `push_subscription` and the opt-in.

## 5. Scheduling

- An **n8n cron** (`fleetsync_cC_notification_tick`, every 30 min) calls
  `GET /api/cron/notifications/tick` over the internal Coolify network alias
  `pictusweb-main-cc`, bearer-token protected.
- The tick runs two idempotent passes: **plan** (`planDeliveries` materializes due
  deliveries for every open occurrence) then **dispatch** (`dispatchDue` sends everything
  due, claiming rows with `FOR UPDATE SKIP LOCKED`).
- **Send time**: account-level, whole or half hours (`notification_send_hour/minute`,
  default 08:30), interpreted in **Europe/Bratislava** (DST-aware). The cron's 30-min
  cadence lines up with the half-hour send slots.
- **Repeat-until-actioned**: a rule can repeat a stage every N days until the obligation
  is actioned (BOOKING up to the due date, OVERDUE after it). The planner never backfills
  past repeat instances, so enabling it can't dump a catch-up burst.

## 6. Delivery infrastructure

- **Email & SMS** → `hono_bun` `POST /api/pictusweb/client/send-reminder`
  (`{channel,to,stage,event,locale,link,logo}`). Email is a dark, branded, table-layout
  template with the Pictusweb mascot embedded inline (CID) and a localized CTA linking to
  `/client/my-fleet`.
- **Push** → `lib/carcare/push.ts` (web-push, VAPID keys in env).
- The app passes the per-org **locale** and an app **link** built from
  `NEXT_PUBLIC_APP_URL || NEXTAUTH_URL`.

## 7. Recipients

`resolveRecipients` = central recipient list ∪ the event's responsible person, minus
per-event exclusions. If no central list is configured, it falls back to the responsible
person (or the garage owner).

## 8. Tiers & limits

Tiers: **FREE / BASIC / BUSINESS**, with per-tier `usersLimit`, `vehiclesLimit`,
`notificationsLimit` (org-level overrides win). Enforcement in the new engine:

- **Vehicles** — `createVehicle` rejects at the effective limit (localized 409).
- **Users** — garage invitations reject when active members + pending invites reach the
  limit (localized 409).
- **Notifications** — metered in `dispatchDue`: **one reminder bills once — the SMS if the
  reminder uses SMS, otherwise the EMAIL** (IN_APP and PUSH are free and never counted).
  The allowance is a **per-vehicle, per-year** rate on the tier (`notifications_per_vehicle`):
  - **FREE**: a flat trial of **15** (`notifications_per_vehicle = 0`, uses `notifications_limit`).
  - **BASIC**: **50 / vehicle / year**. **BUSINESS**: **100 / vehicle / year**.
  - The org's effective yearly allowance = `rate × currentVehiclesCount` (or the flat trial),
    stored on `organizations.notifications_allowance`; the spend is
    `organizations.current_notifications_count`. `checkNotificationLimit`
    (`lib/notificationLimits.ts`) computes/refreshes the allowance and enforces it at the
    **org level** (no per-vehicle tracking). An explicit `organizations.notifications_limit`
    overrides the computed allowance.
  - **FREE** exceeding its trial **soft-deletes the organization** (`deletedAt`);
    **BASIC/BUSINESS** exceeding the yearly allowance sets `notifications_blocked` (lazy
    anniversary reset) and sends a limit-reached email.
- **SMS is a paid-plan channel** — allowed only for BASIC/BUSINESS (FREE is blocked;
  untiered orgs unchanged), enforced at plan time and in dispatch. IN_APP/EMAIL/PUSH are
  not tier-gated.
- **Business dashboards** (fleet cost analytics) are gated on
  `tierRelation.name === 'BUSINESS' || bonusBusinessDashboards`.

## 9. Org send guards

`dispatchDue` never sends **EMAIL or SMS** for an org with `notifications_blocked = true`
or `deletedAt` set (the delivery is suppressed). `notifications_blocked` is set by Stripe
(past_due/unpaid), by the paid-tier quota, and cleared on upgrade.

## 10. Localization

Per-org `notification_locale` (`sk` / `en` / `hu`), set in the central Notifications
settings. Dispatch passes it to hono (email/SMS copy) and localizes the push body.

## 11. Confirmation

Confirmation is **in-app only** (no legacy email confirm link): booking an appointment
stops the booking reminders; marking the occurrence complete stops everything and rolls
to the next cycle.

## 12. Key files

- `lib/carcare/scheduler.ts` — planner, dispatcher, repeat logic, channel rules.
- `lib/carcare/channels.ts` — email/SMS/push senders (hono + web-push).
- `lib/carcare/appointments.ts`, `completion.ts`, `recurrence.ts` — lifecycle.
- `lib/carcare/limits.ts` + `lib/notificationLimits.ts` — tier enforcement.
- `lib/phone.ts` — E.164 normalization.
- `app/api/cron/notifications/tick/route.ts` — the tick endpoint.
- `app/api/carcare/**` — garage, vehicles, events, notifications, push, costs.
- `app/components/carcare/**` — dashboard, bell, settings, event/vehicle views.

## 13. Infrastructure

Next.js 15 app on Coolify (testing: `testing.pictusweb.sk`), Postgres, `hono_bun` for
email/SMS, self-hosted n8n (`notifications.pictusweb.sk`) for the cron, web-push/VAPID for
push. Count columns (`current_users_count`, `current_vehicles_count`,
`current_notifications_count`) are maintained by DB triggers on `users` / `my_vehicles` /
`vehiclenotification`; the new engine additionally increments the notification counter on
each metered send.
