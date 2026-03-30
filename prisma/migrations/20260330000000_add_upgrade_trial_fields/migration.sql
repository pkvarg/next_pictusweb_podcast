-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "pending_tier_id" TEXT;
ALTER TABLE "organizations" ADD COLUMN "pending_tier_starts_at" TIMESTAMP(3);
ALTER TABLE "organizations" ADD COLUMN "free_trial_end_date" TIMESTAMP(3);
ALTER TABLE "organizations" ADD COLUMN "free_trial_tier_id" TEXT;
