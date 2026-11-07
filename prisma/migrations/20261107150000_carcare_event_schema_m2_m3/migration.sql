-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('ONE_TIME', 'FIXED_INTERVAL', 'AFTER_COMPLETION', 'SEASONAL', 'MILEAGE', 'DATE_OR_MILEAGE');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('UPCOMING', 'ACTION_REQUIRED', 'ARRANGED', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventKind" AS ENUM ('LEGAL', 'RECOMMENDED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('BOOK', 'RENEW', 'PAY', 'PURCHASE', 'INSPECT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('BOOKED', 'COMPLETED', 'CANCELLED', 'MISSED');

-- AlterTable
ALTER TABLE "blogs" RENAME CONSTRAINT "Blog_pkey" TO "blogs_pkey";

-- AlterTable
ALTER TABLE "bot_logs" RENAME CONSTRAINT "BotLog_pkey" TO "bot_logs_pkey";

-- AlterTable
ALTER TABLE "confirmation_logs" RENAME CONSTRAINT "confirmation_log_pkey" TO "confirmation_logs_pkey";

-- AlterTable
ALTER TABLE "contact_logs" RENAME CONSTRAINT "ContactLog_pkey" TO "contact_logs_pkey";

-- AlterTable
ALTER TABLE "my_vehicle_mileages" RENAME CONSTRAINT "my_vehicle_mileage_pkey" TO "my_vehicle_mileages_pkey";

-- AlterTable
ALTER TABLE "pending_onboardings" RENAME CONSTRAINT "pending_onboarding_pkey" TO "pending_onboardings_pkey";

-- AlterTable
ALTER TABLE "podcasts" RENAME CONSTRAINT "Podcast_pkey" TO "podcasts_pkey";

-- AlterTable
ALTER TABLE "used_images" RENAME CONSTRAINT "UsedImages_pkey" TO "used_images_pkey";

-- AlterTable
ALTER TABLE "used_podcasts" RENAME CONSTRAINT "UsedPodcasts_pkey" TO "used_podcasts_pkey";

-- AlterTable
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

-- AlterTable
ALTER TABLE "vehicle_notifications" RENAME CONSTRAINT "vehiclenotification_pkey" TO "vehicle_notifications_pkey";

-- AlterTable
ALTER TABLE "visitors_counters" RENAME CONSTRAINT "VisitorsCounter_pkey" TO "visitors_counters_pkey";

-- CreateTable
CREATE TABLE "event_templates" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "country" VARCHAR(2),
    "powertrains" TEXT[],
    "kind" "EventKind" NOT NULL DEFAULT 'RECOMMENDED',
    "action_type" "ActionType" NOT NULL DEFAULT 'BOOK',
    "recurrence_type" "RecurrenceType" NOT NULL,
    "interval_months" INTEGER,
    "interval_km" INTEGER,
    "seasonal_month" INTEGER,
    "seasonal_day" INTEGER,
    "default_lead_days" INTEGER NOT NULL DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_events" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "template_id" TEXT,
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "kind" "EventKind" NOT NULL DEFAULT 'RECOMMENDED',
    "action_type" "ActionType" NOT NULL DEFAULT 'BOOK',
    "recurrence_type" "RecurrenceType" NOT NULL,
    "interval_months" INTEGER,
    "interval_km" INTEGER,
    "seasonal_month" INTEGER,
    "seasonal_day" INTEGER,
    "anchor_date" TIMESTAMP(3),
    "responsible_user_id" TEXT,
    "expected_cost" DECIMAL(10,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "recurring_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_occurrences" (
    "id" TEXT NOT NULL,
    "recurring_event_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "generated_from_id" TEXT,
    "status" "OccurrenceStatus" NOT NULL DEFAULT 'UPCOMING',
    "due_date" TIMESTAMP(3),
    "due_mileage" INTEGER,
    "completed_at" TIMESTAMP(3),
    "completed_mileage" INTEGER,
    "completion_provider_id" TEXT,
    "actual_cost" DECIMAL(10,2),
    "currency" VARCHAR(3),
    "notes" TEXT,
    "skip_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(50),
    "phone" VARCHAR(40),
    "email" VARCHAR(150),
    "website" VARCHAR(255),
    "booking_url" VARCHAR(255),
    "address" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "occurrence_id" TEXT NOT NULL,
    "provider_id" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "booking_reference" TEXT,
    "estimated_cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_templates_key_key" ON "event_templates"("key");

-- CreateIndex
CREATE INDEX "event_templates_country_idx" ON "event_templates"("country");

-- CreateIndex
CREATE INDEX "recurring_events_organization_id_idx" ON "recurring_events"("organization_id");

-- CreateIndex
CREATE INDEX "recurring_events_vehicle_id_idx" ON "recurring_events"("vehicle_id");

-- CreateIndex
CREATE INDEX "recurring_events_responsible_user_id_idx" ON "recurring_events"("responsible_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_occurrences_generated_from_id_key" ON "event_occurrences"("generated_from_id");

-- CreateIndex
CREATE INDEX "event_occurrences_status_due_date_idx" ON "event_occurrences"("status", "due_date");

-- CreateIndex
CREATE INDEX "event_occurrences_vehicle_id_idx" ON "event_occurrences"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_occurrences_recurring_event_id_sequence_no_key" ON "event_occurrences"("recurring_event_id", "sequence_no");

-- CreateIndex
CREATE INDEX "providers_organization_id_idx" ON "providers"("organization_id");

-- CreateIndex
CREATE INDEX "appointments_occurrence_id_idx" ON "appointments"("occurrence_id");

-- CreateIndex
CREATE INDEX "appointments_provider_id_idx" ON "appointments"("provider_id");

-- RenameForeignKey
ALTER TABLE "my_vehicle_mileages" RENAME CONSTRAINT "my_vehicle_mileage_organization_id_fkey" TO "my_vehicle_mileages_organization_id_fkey";

-- RenameForeignKey
ALTER TABLE "my_vehicle_mileages" RENAME CONSTRAINT "my_vehicle_mileage_user_id_fkey" TO "my_vehicle_mileages_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "my_vehicle_mileages" RENAME CONSTRAINT "my_vehicle_mileage_vehicle_id_fkey" TO "my_vehicle_mileages_vehicle_id_fkey";

-- RenameForeignKey
ALTER TABLE "pending_onboardings" RENAME CONSTRAINT "pending_onboarding_tier_id_fkey" TO "pending_onboardings_tier_id_fkey";

-- RenameForeignKey
ALTER TABLE "users" RENAME CONSTRAINT "User_organization_id_fkey" TO "users_organization_id_fkey";

-- RenameForeignKey
ALTER TABLE "vehicle_notifications" RENAME CONSTRAINT "vehiclenotification_my_vehicle_id_fkey" TO "vehicle_notifications_my_vehicle_id_fkey";

-- RenameForeignKey
ALTER TABLE "vehicle_notifications" RENAME CONSTRAINT "vehiclenotification_organization_id_fkey" TO "vehicle_notifications_organization_id_fkey";

-- RenameForeignKey
ALTER TABLE "vehicle_notifications" RENAME CONSTRAINT "vehiclenotification_user_id_fkey" TO "vehicle_notifications_user_id_fkey";

-- AddForeignKey
ALTER TABLE "recurring_events" ADD CONSTRAINT "recurring_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_events" ADD CONSTRAINT "recurring_events_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "my_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_events" ADD CONSTRAINT "recurring_events_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "event_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_events" ADD CONSTRAINT "recurring_events_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_occurrences" ADD CONSTRAINT "event_occurrences_recurring_event_id_fkey" FOREIGN KEY ("recurring_event_id") REFERENCES "recurring_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_occurrences" ADD CONSTRAINT "event_occurrences_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "my_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "event_occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "confirmation_log_notification_id_idx" RENAME TO "confirmation_logs_notification_id_idx";

-- RenameIndex
ALTER INDEX "my_vehicle_mileage_organization_id_idx" RENAME TO "my_vehicle_mileages_organization_id_idx";

-- RenameIndex
ALTER INDEX "my_vehicle_mileage_user_id_idx" RENAME TO "my_vehicle_mileages_user_id_idx";

-- RenameIndex
ALTER INDEX "my_vehicle_mileage_vehicle_id_idx" RENAME TO "my_vehicle_mileages_vehicle_id_idx";

-- RenameIndex
ALTER INDEX "pending_onboarding_email_key" RENAME TO "pending_onboardings_email_key";

-- RenameIndex
ALTER INDEX "pending_onboarding_stripe_session_id_key" RENAME TO "pending_onboardings_stripe_session_id_key";

-- RenameIndex
ALTER INDEX "User_benefit_activation_token_key" RENAME TO "users_benefit_activation_token_key";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "users_email_key";

-- RenameIndex
ALTER INDEX "vehiclenotification_confirmation_token_key" RENAME TO "vehicle_notifications_confirmation_token_key";

-- RenameIndex
ALTER INDEX "vehiclenotification_duty_batch_id_idx" RENAME TO "vehicle_notifications_duty_batch_id_idx";

-- RenameIndex
ALTER INDEX "vehiclenotification_is_aggressive_mode_idx" RENAME TO "vehicle_notifications_is_aggressive_mode_idx";

-- RenameIndex
ALTER INDEX "vehiclenotification_is_pdr_idx" RENAME TO "vehicle_notifications_is_pdr_idx";

-- RenameIndex
ALTER INDEX "vehiclenotification_my_vehicle_id_idx" RENAME TO "vehicle_notifications_my_vehicle_id_idx";

-- RenameIndex
ALTER INDEX "vehiclenotification_organization_id_idx" RENAME TO "vehicle_notifications_organization_id_idx";

-- RenameIndex
ALTER INDEX "vehiclenotification_pdr_reminder_for_idx" RENAME TO "vehicle_notifications_pdr_reminder_for_idx";

-- RenameIndex
ALTER INDEX "vehiclenotification_renewed_from_batch_id_idx" RENAME TO "vehicle_notifications_renewed_from_batch_id_idx";

-- RenameIndex
ALTER INDEX "vehiclenotification_user_id_idx" RENAME TO "vehicle_notifications_user_id_idx";

