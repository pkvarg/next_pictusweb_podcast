-- Add tracking columns for live counts
ALTER TABLE "organizations" ADD COLUMN "current_users_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "organizations" ADD COLUMN "current_vehicles_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "organizations" ADD COLUMN "current_notifications_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "organizations" ADD COLUMN "current_templates_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "organizations" ADD COLUMN "current_notification_types_count" INTEGER NOT NULL DEFAULT 0;

-- Add tier_id column (UUID reference to tiers table)
ALTER TABLE "organizations" ADD COLUMN "tier_id" UUID;

-- Create foreign key constraint
ALTER TABLE "organizations" ADD CONSTRAINT "fk_organization_tier"
  FOREIGN KEY ("tier_id") REFERENCES "tiers"("id");

-- Create index on tier_id
CREATE INDEX "idx_organizations_tier_id" ON "organizations"("tier_id");

-- Create index on deleted_at if not exists
CREATE INDEX IF NOT EXISTS "idx_organizations_deleted_at" ON "organizations"("deleted_at");
