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

## M7 — Providers & appointments ← _backend done on local, awaiting review_

- [x] MVP · Provider create/update/archive(soft-delete)/list (`lib/carcare/providers.ts`): category, contact, phone/email, website & booking URL, notes
- [x] MVP · Appointment book/reschedule/cancel (`lib/carcare/appointments.ts`); scheduled_at independent of due date (BR-01); booking → ARRANGED; cancel → ACTION_REQUIRED, obligation kept (BR-05); booking reference; estimated cost; status enum
- [x] Integration tests pass (`tests/carcare/appointments.itest.ts`): BR-01, BR-05, reschedule, provider CRUD
- [x] MVP · "Preferred provider" per event: `recurring_events.preferred_provider_id` (FK → providers, SET NULL) added (migration `20261107180000_recurring_event_preferred_provider`)
- [ ] call/email/booking-link UI actions → **M14** (surfaces); `completed`/`missed` appointment status → set on completion (M6) / scheduler miss-check (M9); follow-up prompt → **M9** (notification stage)
  > **Review gate M7.** Backend handlers + transitions + preferred-provider field delivered; UI actions and the follow-up reminder deferred.

## M8 — Scheduler: planner + in-app channel ← _done on local, awaiting review_

- [x] Planner `planDeliveries()` (`lib/carcare/scheduler.ts`): materializes `notification_deliveries` from rules, idempotent via `dedupe_key`; event-override-else-org-default rule resolution; due-anchored stages (prep/booking/follow-up/deadline/overdue)
- [x] MVP · Reminder stages: preparation / booking / booking follow-up (deadline/overdue too; appointment/completion/logging anchor on appointment/completion → M9)
- [x] MVP · In-app notification centre (`listInAppNotifications()`)
- [x] Suppression on booking + reactivation on cancel wired into appointment handlers; **tests T7/T8 pass** (`tests/carcare/scheduler.itest.ts`)
- [ ] Cron **tick HTTP endpoint** (token-guarded) → **M9** (one tick does plan + dispatch together)
  > **Review gate M8.** Planner/suppression/in-app logic done & tested; the HTTP cron entrypoint lands with the dispatcher in M9.

## M9 — Scheduler: dispatcher + email/SMS ← _done on local, awaiting review_

- [x] Dispatcher `dispatchDue()` (`lib/carcare/scheduler.ts`): claim with `FOR UPDATE SKIP LOCKED` (T11), retry→SCHEDULED/FAILED (T13), counts logged
- [x] Channel senders (`lib/carcare/channels.ts`, injectable): email/SMS via hono_bun, in-app no-op, push stub (M15)
- [x] MVP · Channel opt-in gating + SMS monthly limit enforced (T12); SMS counter increments on success
- [x] Cron **tick endpoint** `GET /api/cron/notifications/tick` (token-guarded) — plan pass + dispatch pass
- [x] MVP · Stages deadline + overdue (due-anchored, from M8 planner)
- [x] Integration tests pass (`tests/carcare/dispatch.itest.ts`): T11, T12, T13, opt-in gating, counter
- [ ] appointment / completion / logging stages (anchored on appointment/completion) + the follow-up prompt → **M10**
- [ ] ⚠️ hono_bun needs a generic `POST /pictusweb/client/sendReminder` endpoint for real email/SMS (dispatcher tested with injected fakes; cross-service wiring)
  > **Review gate M9.** Dispatcher + gating + cron entrypoint done & tested; real email/SMS transport needs the hono endpoint; appointment/completion-anchored stages land in M10.

## M10 — Full suppression + reassignment + quiet hours ← _done on local, awaiting review_

- [x] MVP · Completion suppresses all remaining reminders across channels (`cancelAllDeliveries`, wired into `completeOccurrence`) — **T9**; booking suppression/reactivation already in M8
- [x] MVP · Reassign responsible user re-targets future reminders (`reassignResponsibleUser`: suppress old recipient, re-plan for new) — **T10**
- [x] MVP · Quiet hours: planner shifts sends out of the recipient's quiet window (`applyQuietHours`, tz-aware) — **T15** (unit test)
- [x] hono*bun `POST /api/pictusweb/client/send-reminder` endpoint added (email+SMS) — \_separate repo, needs its own commit + deploy*
- [ ] occurrence skip/cancel transition handlers (will call `cancelAllDeliveries`); **snooze** (per-user runtime action); appointment/completion/logging-anchored stage scheduling → small follow-ups
  > **Review gate M10.** The three BR-critical behaviors (T9/T10/T15) done & tested. Snooze + the appointment/completion-anchored reminder stages remain as bounded follow-ups.

---

## Product surfaces & onboarding (M11–M15)

## M11 — Accounts, garage, sharing & GDPR ← _backend done on local, awaiting review_

- [x] MVP · Registration and login (reuse); password reset and account recovery (reuse)
- [x] MVP · User profile and preferences (settings page already built)
- [x] MVP · Garage = organization (reuse); multiple vehicles already supported
- [x] MVP · Garage members & invitations (`lib/carcare/garage.ts`: createInvitation/acceptInvitation, token + 7-day expiry); schema `garage_invitations`
- [x] MVP · Roles Owner/Member/Viewer (`GarageMembership`); per-vehicle access (`VehicleAccess`); backend enforcement `canAccessVehicle()` + legacy single-org bridge
- [x] MVP · Owner fallback for reminder recipient wired into the planner (`resolveGarageOwner`)
- [x] MVP · Assign/reassign responsibility (M10 `reassignResponsibleUser`); account deletion detaches responsibilities
- [x] **MVP · GDPR** (`lib/carcare/gdpr.ts`): `exportGarageData` (bundle) + `deleteUserData` (erasure: remove deliveries/memberships/access, detach events, anonymize + soft-delete)
- [x] Integration tests (`tests/carcare/garage.itest.ts`): access, owner-fallback, invite-accept, export, erasure
- [x] MVP · `removeMember()` — detaches their events (→ owner fallback), suppresses their reminders, deletes membership
- [ ] invitation **email** send (hono) + roles/members **UI** → **M14**
  > **Review gate M11.** Roles/access/invitations/owner-fallback/GDPR backend delivered & tested; UI + invite-email are M14/surfaces.

## M12 — Vehicles & catalogue ← _backend done on local, awaiting review_

- [x] MVP · `createVehicle` (`lib/carcare/vehicles.ts`); edit/archive via existing MyVehicle CRUD + `deletedAt` (reuse); nickname + identifiers
- [x] MVP · Make, model, year, powertrain (`Powertrain` enum), country columns added; mileage reuse (`my_vehicle_mileages`)
- [x] MVP · Searchable make/model catalogue (`vehicle_catalogue` + `searchCatalogue`, 10-row sample seed); manual entry
- [x] MVP · Store VIN (new) + EČV (existing `registration`); `suggestTemplatesForVehicle` (powertrain + country applicability)
- [x] Integration tests (`tests/carcare/vehicles.itest.ts`): catalogue search, structured create, template suggestion
- [ ] catalogue real-data import (seed is a 10-row sample); onboarding/vehicle-edit **UI** → **M14**
  > **Review gate M12.** Schema + create/search/suggest backend delivered & tested; real catalogue data + UI are M14/import.

## M13 — Event catalogue & Slovak templates ← _backend done on local, awaiting review_

- [x] MVP · Universal templates (service, insurance, tyres, warranty) + EV-specific (battery_warranty, charging_subscription); 12 seeded
- [x] MVP · SK templates (stk, ek, pzp, highway_vignette) with country scoping + legal-vs-recommended (`kind`); EK excludes BEV/HYDROGEN
- [x] MVP · `activateTemplate` (idempotent, creates event + first occurrence) + `createCustomEvent` (`lib/carcare/events.ts`); edit/disable via existing event CRUD; applicability via `suggestTemplatesForVehicle`
- [x] Integration tests (`tests/carcare/events.itest.ts`): seed present, suggestion by powertrain/country, activation idempotency, custom event
- [ ] template-admin **UI**, i18n display names, regulatory-rule review → **M14** / content pass (classifications & intervals need legal verification before prod)
  > **Review gate M13.** Seed + activation/custom-event backend delivered & tested. ⚠️ Intervals & legal classifications are first-pass — verify against current SK rules before go-live.

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
