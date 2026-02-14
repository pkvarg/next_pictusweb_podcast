-- Drop redundant organization columns from tables that have organization_id
-- These columns now contain UUIDs (same as organization_id) and are no longer needed

-- Drop organization column from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS organization;

-- Drop organization column from my_vehicles table
ALTER TABLE my_vehicles DROP COLUMN IF EXISTS organization;

-- Drop organization column from my_vehicle_expenses table
ALTER TABLE my_vehicle_expenses DROP COLUMN IF EXISTS organization;

-- Drop organization column from notification_templates table
-- First drop the index if it exists
DROP INDEX IF EXISTS notification_templates_organization_idx;
ALTER TABLE notification_templates DROP COLUMN IF EXISTS organization;

-- Drop organization column from notification_type_options table
-- First drop the index if it exists
DROP INDEX IF EXISTS notification_type_options_organization_idx;
ALTER TABLE notification_type_options DROP COLUMN IF EXISTS organization;

-- Drop organization column from notification_channel_options table
-- First drop the index if it exists
DROP INDEX IF EXISTS notification_channel_options_organization_idx;
ALTER TABLE notification_channel_options DROP COLUMN IF EXISTS organization;
