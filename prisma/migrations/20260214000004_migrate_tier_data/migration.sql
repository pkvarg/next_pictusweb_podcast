-- Update organizations with tier_id based on existing tier enum
UPDATE "organizations" o
SET "tier_id" = t.id
FROM "tiers" t
WHERE o.tier::text = t.name;
