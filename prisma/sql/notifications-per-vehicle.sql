ALTER TABLE "tiers" ADD COLUMN IF NOT EXISTS "notifications_per_vehicle" INT NOT NULL DEFAULT 0;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "notifications_allowance" INT NOT NULL DEFAULT 0;
UPDATE "tiers" SET "notifications_per_vehicle" = 50 WHERE upper(name) = 'BASIC';
UPDATE "tiers" SET "notifications_per_vehicle" = 100 WHERE upper(name) = 'BUSINESS';
UPDATE "tiers" SET "notifications_limit" = 15, "notifications_per_vehicle" = 0 WHERE upper(name) = 'FREE';
