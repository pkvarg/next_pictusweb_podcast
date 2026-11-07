# CarCare / FleetSync v5 — Build Progress

Branch: `main-cC` · Dev DB: `pg-local-cc` (Docker, `postgresql://postgres:secret@localhost:5434/postgres`)
Design refs: `~/Desktop/CarCare/FleetSync_E00_Audit_and_Plan.md`, `FleetSync_EventEngine_Scheduler_Design.md`, `FleetSync_Developer_Specification_MVP_Backlog_v5.docx`, Application Inventory v1.0 (137 features), Eva's UI mockups.
Prod DB change log (SQL to run on prod): `CARCARE_PROD_DB_CHANGES.sql`

**Working agreement:** one milestone at a time. Each milestone is implemented against the local DB/branch only, then **paused for review**. Continue only after it's ticked off.

Legend: `[ ]` todo · `[~]` in progress / awaiting review · `[x]` reviewed & accepted
Feature tags: **MVP** = first release · the MVP feature checklist is nested under each milestone; P2/P3 features are in the Deferred appendix.

---

## M0 — Environment setup

- [x] Merge `main-release1-barbora2` → `main`, push; branch `main-cC` created & checked out
- [x] Local dev DB `pg-local-cc` on port 5434 (copy of `pg-local`), 27 tables verified
- [x] Fix malformed `DATABASE_URL` in `.env` (was missing `=`) → points at 5434
- [x] Prisma connects to 5434, `migrate status` = up to date (no drift)
- [x] Progress tracker + prod DB change log files created
  > **Review gate M0** — environment ready.

## M1 — Table-name normalization (plural snake*case) ← \_done on local, awaiting review*

- [x] Rename **12 tables** → lowercase snake_case plural (Prisma `@@map` + migration `20261107140000_plural_snake_case_table_names`); applied to :5434, status clean, validate ok, client generated + smoke-tested
- [x] App/hono_bun: no raw SQL on renamed tables (safe)
- [x] n8n: 5 **published** workflows corrected in `n8n_cC/` + staged inactive as `fleetsync_cC_*` via MCP
- [x] SQL logged to `CARCARE_PROD_DB_CHANGES.sql`
  > **Review gate M1.** ⚠️ Prod cutover: rename SQL **in lockstep** with activating `fleetsync_cC_*`.

---

## Event engine & scheduler — core (M2–M10)

## M2 — Core event schema ← _done on local, awaiting review_

- [x] Enums: RecurrenceType, OccurrenceStatus, EventKind, ActionType (+ AppointmentStatus in M3). (NotificationStage/Channel/DeliveryStatus deferred to M4)
- [x] `EventTemplate`, `RecurringEvent`, `EventOccurrence` + indexes + unique constraints (`generated_from_id` unique, `recurring_event_id+sequence_no` unique)
- [x] Back-relations added to `User`/`MyVehicle`/`Organization`
- [x] Prisma migration `20261107150000_carcare_event_schema_m2_m3` applied to :5434; status clean; client generated + smoke-tested; logged for prod
  > **Review gate M2.**

## M3 — Providers & appointments schema ← _done on local, awaiting review_

- [x] `Provider`, `Appointment` models; `AppointmentStatus` enum; appointment date (`scheduled_at`) independent of occurrence due date (BR-01)
- [x] FKs + indexes; included in the same migration as M2; logged for prod
  > **Review gate M3.**

## M4 — Notifications schema + user preferences ← _done on local, awaiting review_

- [x] `NotificationRule`, `NotificationDelivery` (`dedupe_key` unique) + enums NotificationStage, Channel, DeliveryStatus
- [x] MVP · User preferences: time zone (default Europe/Bratislava) — _note: language already via next-intl; currency lives per-event (`currency`), not yet a user default_
- [x] MVP · Notification preferences (channel opt-ins, quiet hours start/end)
- [x] MVP · SMS usage limits (sms_monthly_limit=20, sms_sent_this_month)
- [x] Migration `20261107160000_carcare_notifications_m4` applied to :5434; status clean; client generated + smoke-tested; logged for prod
  > **Review gate M4.** _Snooze_ is runtime behaviour (deferred to the scheduler milestones M8–M10), not a schema field.

## M5 — Recurrence math + tests ← _done on local, awaiting review_

- [x] MVP · One-time and recurring events
- [x] MVP · Monthly, annual, day/week and custom recurrence (FIXED_INTERVAL / AFTER_COMPLETION; `intervalDays` + `intervalMonths`, days take precedence)
- [x] MVP · Seasonal recurrence
- [x] MVP · Combined date/mileage (whichever first); mileage-only; due dates and mileage thresholds
- [x] `computeNextDue()` in `lib/carcare/recurrence.ts` (pure, no deps); 13 unit tests pass incl. T2–T6, T14 (`tests/carcare/recurrence.test.ts`)
  > **Review gate M5.** Pure function; no DB change. The DB-level "edit future schedule never rewrites past occurrences" (true T14) is enforced in M6's completion handler.

## M6 — Completion, next occurrence, history & costs ← _core done on local, awaiting review_

- [x] MVP · `completeOccurrence()` (`lib/carcare/completion.ts`): mark completed; record completion date, mileage, actual cost, provider, notes
- [x] MVP · Automatically create next occurrence (idempotent — early-return on re-submit + `generated_from_id` unique backstop); **integration test T1 passes** (`tests/carcare/completion.itest.ts`, run via `vitest.itest.config.ts`)
- [ ] skip / cancel / postpone status transitions → folded into **M7** (appointment-driven) / **M10** (lifecycle + suppression)
- [ ] Chronological service history + expense categories / vehicle cost totals / upcoming expected expenses → **M14** (surfaces; builds on existing `my_vehicle_expenses`)
  > **Review gate M6.** Core completion engine delivered; the remaining items are UI/transition surfaces deliberately deferred to M7/M10/M14 where they fit.

## M7 — Providers & appointments

- [ ] MVP · Add/edit provider; category & contact details; telephone & email shortcuts; website & booking URL; preferred provider; provider notes
- [ ] MVP · Create/record appointment; appointment date independent of due date; edit/reschedule; cancel
- [ ] MVP · Status (booked/completed/cancelled/missed); booking reference; estimated cost
- [ ] MVP · Open provider call/email/booking actions; appointment follow-up prompt
  > **Review gate M7.**

## M8 — Scheduler: planner + in-app channel

- [ ] Cron tick endpoint (token-guarded); planner materializes deliveries via `dedupeKey`
- [ ] MVP · Reminder stages: preparation/booking, booking follow-up
- [ ] MVP · In-app notification centre
- [ ] Suppression on booking (tests T7/T8)
  > **Review gate M8.**

## M9 — Scheduler: dispatcher + email/SMS

- [ ] Dispatcher claim `FOR UPDATE SKIP LOCKED` (test T11); retries/logging
- [ ] MVP · Email + SMS delivery via hono_bun; SMS limits enforced (T12/T13)
- [ ] MVP · Reminder stages: appointment, deadline, overdue, completion, logging
  > **Review gate M9.**

## M10 — Full suppression + reassignment + quiet hours

- [ ] MVP · Smart suppression on complete/cancel/reassign across channels (T9/T10)
- [ ] MVP · Assign responsible person → reminders to responsible user; reassignment
- [ ] MVP · Quiet hours + snooze scheduling (T15)
  > **Review gate M10.**

---

## Product surfaces & onboarding (M11–M15)

## M11 — Accounts, garage, sharing & GDPR

- [x] MVP · Registration and login (reuse); password reset and account recovery (reuse)
- [x] MVP · User profile and preferences (settings page already built)
- [ ] MVP · Create and rename garage; multiple vehicles per garage
- [ ] MVP · Garage members & invitations (invite by email, accept/reject, expiry)
- [ ] MVP · Roles Owner/Member/Viewer; per-vehicle access; backend access enforcement
- [ ] MVP · Assign responsibility; revoke/reassign on member removal
- [ ] **MVP · GDPR: account deletion and data export** (per-garage export + deletion)
  > **Review gate M11.**

## M12 — Vehicles & catalogue

- [ ] MVP · Add/edit/archive vehicle; vehicle nickname and identifiers
- [ ] MVP · Make, model, year and powertrain; current mileage and updates; country of registration
- [ ] MVP · Searchable make/model catalogue; manual vehicle entry
- [ ] MVP · Store VIN and EČV; vehicle technical profile; powertrain-specific event suggestions
  > **Review gate M12.**

## M13 — Event catalogue & Slovak templates

- [ ] MVP · Universal event templates; ICE/hybrid/EV templates
- [ ] MVP · Country-specific templates (STK/EK/PZP/tyres/service/vignette/permits); legal vs recommended
- [ ] MVP · Create custom event; edit/disable/remove suggested events
- [ ] MVP · Admin: event template administration; country applicability rules; regulatory catalogue updates; multilingual UI framework
  > **Review gate M13.**

## M14 — Dashboard & calendar

- [ ] MVP · Action-first home: action cards, deadlines, booked appointments, responsibility, recently completed, vehicle filters
- [ ] MVP · Events list + calendar (due dates vs appointment dates)
- [ ] MVP · Responsive navigation Home / Events / Garage / Costs / More
  > **Review gate M14.**

## M15 — PWA + web push

- [ ] MVP · Installable PWA shell (manifest + service worker)
- [ ] MVP · Web push infrastructure + opt-in/delivery (push notification channel)
  > **Review gate M15.**

---

## Cutover & operational readiness (M16–M17)

## M16 — Data migration from `vehicle_notifications`

- [ ] Backfill existing rows → occurrences; reconstruct recurrence lineage; reconciliation report (BR-13)
- [ ] Dual-run with legacy n8n path; retire after reconcile
  > **Review gate M16.**

## M17 — Operational readiness & pilot (all MVP)

- [ ] MVP · Notification delivery monitoring; audit of critical changes; user/garage support tools
- [ ] MVP · Automated regression tests (recurrence, reminders, access, migration) in CI
- [ ] MVP · Error monitoring + backups + restore test
- [ ] MVP · Staged pilot deployment; acceptance scenario passes, migrated records reconcile
  > **Review gate M17.**

---

## Deferred — Phase 2 / Phase 3 (not in MVP)

**Accounts:** Social login / SSO (P2) · Subscription & billing management (P2)
**Garage/vehicles:** Vehicle photo (P2) · Ownership transfer / vehicle sale (P2)
**Vehicle identification:** Automatic VIN decoding (P2) · Automatic EČV lookup (P2) · Registration certificate scanning (P2) · Manufacturer service schedule lookup (P2)
**Event catalogue:** Manufacturer-specific maintenance rules (P2) · Additional country catalogues (P2)
**Event scheduling:** Estimated mileage due date (P2)
**Providers:** Provider history and costs (P2) · Provider discovery and ratings (P2) · Direct provider booking (P3)
**History/costs:** Advanced budgets and forecasts (P2) · Cost per kilometre (P2) · Expense exports (P2)
**Documents (all P2):** attachment to completion record · invoice & policy storage · inspection & warranty documents · document expiry extraction · OCR & metadata recognition · document sharing permissions · export vehicle documentation
**Reports (P2):** reports & analytics module
**Integrations:** calendar integration (P2) · VIN/EČV APIs (P2) · manufacturer data (P2) · direct provider booking API (P3) · connected-car (P3) · charging networks (P3) · recall database (P3)
**Administration:** billing & plan administration (P2) · advanced analytics & support dashboard (P2)

Inventory totals: ~137 features (87 MVP · 43 P2 · 7 P3).
