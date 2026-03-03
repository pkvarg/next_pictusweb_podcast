-- AlterTable: Add canCreateBenefit to Organization
ALTER TABLE "organizations" ADD COLUMN "can_create_benefit" BOOLEAN NOT NULL DEFAULT false;

-- Set canCreateBenefit = true for all existing BUSINESS tier organizations
UPDATE "organizations" o
SET "can_create_benefit" = true
FROM "tiers" t
WHERE o."tier_id" = t."id" AND t."name" = 'BUSINESS';
