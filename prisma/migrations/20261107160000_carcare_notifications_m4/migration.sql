-- CreateEnum
CREATE TYPE "NotificationStage" AS ENUM ('PREPARATION', 'BOOKING', 'BOOKING_FOLLOWUP', 'APPOINTMENT', 'DEADLINE', 'OVERDUE', 'COMPLETION', 'LOGGING');

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'SUPPRESSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "channel_opt_ins" "Channel"[],
ADD COLUMN     "quiet_hours_end" INTEGER,
ADD COLUMN     "quiet_hours_start" INTEGER,
ADD COLUMN     "sms_monthly_limit" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "sms_sent_this_month" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Europe/Bratislava';

-- CreateTable
CREATE TABLE "notification_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "recurring_event_id" TEXT,
    "stage" "NotificationStage" NOT NULL,
    "lead_days" INTEGER NOT NULL DEFAULT 0,
    "channels" "Channel"[],
    "repeat_until_actioned" BOOLEAN NOT NULL DEFAULT false,
    "repeat_every_days" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "occurrence_id" TEXT NOT NULL,
    "recurring_event_id" TEXT NOT NULL,
    "stage" "NotificationStage" NOT NULL,
    "channel" "Channel" NOT NULL,
    "recipient_user_id" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "sent_at" TIMESTAMP(3),
    "suppressed_reason" TEXT,
    "dedupe_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_rules_organization_id_stage_idx" ON "notification_rules"("organization_id", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "notification_deliveries_dedupe_key_key" ON "notification_deliveries"("dedupe_key");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_scheduled_for_idx" ON "notification_deliveries"("status", "scheduled_for");

-- CreateIndex
CREATE INDEX "notification_deliveries_occurrence_id_stage_idx" ON "notification_deliveries"("occurrence_id", "stage");

-- AddForeignKey
ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_recurring_event_id_fkey" FOREIGN KEY ("recurring_event_id") REFERENCES "recurring_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "event_occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_recurring_event_id_fkey" FOREIGN KEY ("recurring_event_id") REFERENCES "recurring_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

