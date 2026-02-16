-- Add notification usage tracking and onboarding columns to organizations
ALTER TABLE "organizations" ADD COLUMN "notification_period_start" TIMESTAMP(3);
ALTER TABLE "organizations" ADD COLUMN "notifications_blocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN "onboarded_by" VARCHAR(255);
