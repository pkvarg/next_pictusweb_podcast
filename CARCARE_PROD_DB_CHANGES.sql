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


-- ----------------------------------------------------------------------------
-- M12 — Vehicle powertrain + make/model catalogue
--      STATUS: APPLIED on local :5434 (2026-11-07)
--      Prisma migration: prisma/migrations/20261107200000_carcare_vehicle_catalogue_m12
-- ----------------------------------------------------------------------------
-- Additive. Enum Powertrain. New nullable columns on my_vehicles: nickname, make,
-- model, powertrain, country, vin. New table vehicle_catalogue (unique make+model+powertrain)
-- with a MINIMAL sample seed (10 rows) — replace/extend with a real catalogue import on prod.
-- NOTE: the seed uses gen_random_uuid() (built-in on PG13+).
-- Authoritative SQL: the migration file above / `prisma migrate deploy`.


-- ----------------------------------------------------------------------------
-- M13 — Slovak event templates (data seed)
--      STATUS: APPLIED on local :5434 (2026-11-07)
--      Prisma migration: prisma/migrations/20261107210000_carcare_slovak_event_templates_m13
-- ----------------------------------------------------------------------------
-- Data-only. INSERTs 12 event_templates (stk, ek, pzp, comprehensive_insurance,
-- winter_tyres, summer_tyres, regular_service, highway_vignette, parking_permit,
-- warranty, battery_warranty, charging_subscription), ON CONFLICT(key) DO NOTHING.
-- Legal vs recommended via kind; SK-scoped where legal; EK excludes BEV/HYDROGEN.
-- Review/adjust intervals & legal classification against current SK rules before prod.

-- M14b: accent-insensitive catalogue search (searchCatalogue uses unaccent()).
-- Required for /api/carcare/catalogue so "skoda" matches "Škoda". Idempotent.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- M16: legacy data migration (vehicle_notifications -> my_vehicles / recurring_events /
-- event_occurrences). NOT SQL — run the idempotent route once on prod after deploy:
--   curl -X POST "https://<host>/api/carcare/admin/migrate-notifications?dryRun=true&token=$CRON_TOKEN"   # review
--   curl -X POST "https://<host>/api/carcare/admin/migrate-notifications?token=$CRON_TOKEN"               # apply
-- Mapping: STK/EK, Kontrola (checkup), Technický preukaz platnosť (distinct), Výmena oleja,
-- Diaľničná známka, Poistenie->PZP, Pneu leto/zima (seasonal). One vehicle per org+registration,
-- one recurring event per vehicle+type, one UPCOMING occurrence (next due). Re-runnable.

-- M15 Part 2: web push. New table push_subscriptions (Prisma migration
-- 20261108120000_carcare_push_subscriptions). Prod also needs env vars:
--   NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:)
-- Generate once: node -e "console.log(require('web-push').generateVAPIDKeys())"
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");
CREATE INDEX IF NOT EXISTS "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");
ALTER TABLE "push_subscriptions" DROP CONSTRAINT IF EXISTS "push_subscriptions_user_id_fkey";
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
