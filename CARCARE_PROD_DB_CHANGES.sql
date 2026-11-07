-- ============================================================================
-- CarCare / FleetSync v5 — PRODUCTION DB CHANGE LOG
-- ============================================================================
-- Every DDL change applied to the local dev DB (pg-local-cc, :5434) on branch
-- main-cC is recorded here in order, to be replayed on the production DB when
-- the work is accepted.
--
-- Source of truth remains the Prisma migrations in prisma/migrations/ (deploy
-- with `prisma migrate deploy`). This file is the human-readable equivalent for
-- running manually on prod, and for review.
--
-- DO NOT run a section on prod until its milestone is accepted; read caveats.
--
-- Prod DB (from .env): postgres@91.229.245.241:5442/postgres
-- ============================================================================


-- ----------------------------------------------------------------------------
-- M1 — Table-name normalization (plural snake_case)
--      STATUS: APPLIED on local :5434 (2026-11-07)
--      Prisma migration: prisma/migrations/20261107140000_plural_snake_case_table_names
-- ----------------------------------------------------------------------------
-- 12 tables renamed. RENAME preserves all data, indexes and foreign keys
-- (FKs reference table OIDs, not names). App code is unaffected (Prisma Client
-- uses model names via @@map; no raw SQL in app/hono_bun touches these tables).
--
-- ⚠️ PROD CAVEATS — do these in lockstep with the rename:
--   1. n8n Postgres nodes query prod directly. Two tables below are referenced
--      by n8n: `vehiclenotification` (26 workflows) and `confirmation_log`
--      (8 workflows). Corrected copies of the 5 PUBLISHED ones are staged in
--      n8n as `fleetsync_cC_*` (inactive) and mirrored in ../n8n_cC/.
--      Activate them (or import over originals) right after this runs.
--   2. hono_bun: no raw SQL references these tables (verified) — no change.
--
-- Run inside a transaction:

BEGIN;
ALTER TABLE "Blog"              RENAME TO blogs;
ALTER TABLE "Podcast"           RENAME TO podcasts;
ALTER TABLE "UsedImages"        RENAME TO used_images;
ALTER TABLE "UsedPodcasts"      RENAME TO used_podcasts;
ALTER TABLE "VisitorsCounter"   RENAME TO visitors_counters;
ALTER TABLE "User"              RENAME TO users;
ALTER TABLE "BotLog"            RENAME TO bot_logs;
ALTER TABLE "ContactLog"        RENAME TO contact_logs;
ALTER TABLE vehiclenotification RENAME TO vehicle_notifications;
ALTER TABLE confirmation_log    RENAME TO confirmation_logs;
ALTER TABLE my_vehicle_mileage  RENAME TO my_vehicle_mileages;
ALTER TABLE pending_onboarding  RENAME TO pending_onboardings;
COMMIT;

-- Tables left unchanged (already plural snake_case): blogs? no — already listed.
-- Unchanged: duty_renewal_presets, invoices, ip_reputations, my_vehicle_expenses,
-- my_vehicles, notification_channel_options, notification_templates,
-- notification_type_options, organizations, picdocs_orgs, picdocs_runs, tiers,
-- trusted_devices, verification_codes.


-- ----------------------------------------------------------------------------
-- M2 + M3 — CarCare event engine schema (new tables + enums)
--      STATUS: APPLIED on local :5434 (2026-11-07)
--      Prisma migration: prisma/migrations/20261107150000_carcare_event_schema_m2_m3
-- ----------------------------------------------------------------------------
-- Additive only — creates enums (RecurrenceType, OccurrenceStatus, EventKind,
-- ActionType, AppointmentStatus) and tables: event_templates, recurring_events,
-- event_occurrences, providers, appointments (with indexes, unique constraints
-- and FKs). No existing data touched.
--
-- NOTE: this migration also RENAMEs constraints/indexes left stale by M1's
-- `ALTER TABLE ... RENAME` (e.g. "User_pkey" -> "users_pkey",
-- "vehiclenotification_*_idx" -> "vehicle_notifications_*_idx"). Those were not
-- in the M1 block above because ALTER TABLE RENAME does not rename constraints.
-- On prod, running the M1 block then this migration yields the correct state.
--
-- The authoritative, runnable SQL is the migration file above
-- (prisma/migrations/20261107150000_carcare_event_schema_m2_m3/migration.sql),
-- or deploy with `prisma migrate deploy`.


-- ----------------------------------------------------------------------------
-- M4 — Notifications schema + user preferences
--      STATUS: APPLIED on local :5434 (2026-11-07)
--      Prisma migration: prisma/migrations/20261107160000_carcare_notifications_m4
-- ----------------------------------------------------------------------------
-- Additive only. Enums: NotificationStage, Channel, DeliveryStatus.
-- Tables: notification_rules, notification_deliveries (dedupe_key UNIQUE).
-- New columns on "users": timezone (default 'Europe/Bratislava'),
--   quiet_hours_start, quiet_hours_end, channel_opt_ins (Channel[]),
--   sms_monthly_limit (default 20), sms_sent_this_month (default 0).
-- Existing rows get the defaults. No data touched.
-- Authoritative SQL: the migration file above / `prisma migrate deploy`.


-- ----------------------------------------------------------------------------
-- M5 addendum — recurrence interval_days column
--      STATUS: APPLIED on local :5434 (2026-11-07)
--      Prisma migration: prisma/migrations/20261107170000_recurrence_interval_days
-- ----------------------------------------------------------------------------
-- Additive. Enables day-granular recurrence (e.g. "every 2 weeks").
ALTER TABLE "event_templates"  ADD COLUMN "interval_days" INTEGER;
ALTER TABLE "recurring_events" ADD COLUMN "interval_days" INTEGER;


-- ----------------------------------------------------------------------------
-- M7 addendum — preferred provider per recurring event
--      STATUS: APPLIED on local :5434 (2026-11-07)
--      Prisma migration: prisma/migrations/20261107180000_recurring_event_preferred_provider
-- ----------------------------------------------------------------------------
ALTER TABLE "recurring_events" ADD COLUMN "preferred_provider_id" TEXT;
ALTER TABLE "recurring_events" ADD CONSTRAINT "recurring_events_preferred_provider_id_fkey"
  FOREIGN KEY ("preferred_provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ----------------------------------------------------------------------------
-- M11 — Garage sharing, roles, invitations
--      STATUS: APPLIED on local :5434 (2026-11-07)
--      Prisma migration: prisma/migrations/20261107190000_carcare_garage_sharing_m11
-- ----------------------------------------------------------------------------
-- Additive only. Enums: GarageRole, InvitationStatus.
-- Tables: garage_memberships (unique org+user), vehicle_access (unique membership+vehicle),
--         garage_invitations (unique token). FKs cascade from organization/user/vehicle.
-- Authoritative SQL: the migration file above / `prisma migrate deploy`.
