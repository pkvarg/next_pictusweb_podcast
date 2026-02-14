-- Migration: Drop legacy count columns from organizations table
-- These columns were replaced by current_*_count columns which are
-- automatically maintained and reflect live counts excluding deleted items

-- Step 1: Drop legacy columns
ALTER TABLE organizations
DROP COLUMN IF EXISTS number_users;

ALTER TABLE organizations
DROP COLUMN IF EXISTS number_vehicles;

ALTER TABLE organizations
DROP COLUMN IF EXISTS number_notification_types;

-- Verification: Check that current_*_count columns are being used
SELECT
    name,
    current_users_count,
    current_vehicles_count,
    current_notifications_count,
    current_templates_count,
    current_notification_types_count
FROM organizations
WHERE deleted_at IS NULL
ORDER BY name
LIMIT 10;
