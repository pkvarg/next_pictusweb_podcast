-- Per-vehicle SMS allowance. BASIC = 50, BUSINESS = 100 SMS per vehicle per year.
-- (The notifications_per_vehicle column already exists with default 0; 0 keeps a tier on its
-- flat notifications_limit, which is what the FREE trial continues to use.)
UPDATE "tiers" SET "notifications_per_vehicle" = 50 WHERE "name" = 'BASIC';
UPDATE "tiers" SET "notifications_per_vehicle" = 100 WHERE "name" = 'BUSINESS';

-- Clear the per-org override that signup used to auto-copy from the tier's flat limit, so paid
-- orgs fall through to the per-vehicle calculation (perVehicle × current_vehicles_count) and
-- the allowance scales as vehicles are added. Only clears overrides that still equal the
-- tier's flat limit (i.e. the auto-copied value) — any genuinely custom admin override is kept.
UPDATE "organizations" o
SET "notifications_limit" = NULL
FROM "tiers" t
WHERE o."tier_id" = t."id"
  AND t."name" IN ('BASIC', 'BUSINESS')
  AND o."notifications_limit" = t."notifications_limit";
