-- Migration: Drop old tier enum column from organizations table
-- This migration drops the legacy tier column since all organizations
-- now use tier_id foreign key to reference the tiers table

-- Step 1: Drop the tier column (enum)
ALTER TABLE organizations
DROP COLUMN IF EXISTS tier;

-- Verification: Check that tier_id is being used
SELECT
    o.name,
    o.tier_id,
    t.name as tier_name
FROM organizations o
LEFT JOIN tiers t ON o.tier_id = t.id
WHERE o.deleted_at IS NULL
ORDER BY o.name;
