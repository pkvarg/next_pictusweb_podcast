-- Migration: VehicleNotification table - Add organization_id, drop company, vehicleType, sheetRowId
-- This migration:
-- 1. Adds organization_id column
-- 2. Maps existing company names to organization UUIDs
-- 3. Drops sheetRowId column
-- 4. Drops vehicleType column (use myVehicle.type instead)
-- 5. Drops company column (replaced by organization_id)

-- Step 1: Add organization_id column (nullable initially)
ALTER TABLE vehiclenotification
ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Step 2: Map existing company names to organization UUIDs
-- Update notifications to link to correct organization by matching company name
UPDATE vehiclenotification vn
SET organization_id = o.id
FROM organizations o
WHERE LOWER(TRIM(vn.company)) = LOWER(TRIM(o.name))
AND vn.organization_id IS NULL
AND vn.company IS NOT NULL;

-- Step 3: For notifications with myVehicleId, use the vehicle's organizationId
UPDATE vehiclenotification vn
SET organization_id = mv.organization_id
FROM my_vehicles mv
WHERE vn.my_vehicle_id = mv.id
AND vn.organization_id IS NULL
AND vn.my_vehicle_id IS NOT NULL;

-- Step 4: Check for unmapped notifications (for logging purposes)
-- These notifications have a company but it doesn't match any organization
SELECT
    id,
    company,
    person_name,
    vehicle_registration,
    duty_date,
    'No matching organization found' as issue
FROM vehiclenotification
WHERE organization_id IS NULL
AND company IS NOT NULL
ORDER BY company;

-- Step 5: Drop the old columns
-- Drop sheetRowId (no longer used)
ALTER TABLE vehiclenotification
DROP COLUMN IF EXISTS sheet_row_id;

-- Drop vehicleType (use myVehicle.type instead through join)
ALTER TABLE vehiclenotification
DROP COLUMN IF EXISTS vehicle_type;

-- Drop company (replaced by organization_id)
ALTER TABLE vehiclenotification
DROP COLUMN IF EXISTS company;

-- Step 6: Add index on organization_id for better query performance
CREATE INDEX IF NOT EXISTS idx_vehiclenotification_organization_id
ON vehiclenotification(organization_id);

-- Step 7: Add foreign key constraint
ALTER TABLE vehiclenotification
ADD CONSTRAINT fk_vehiclenotification_organization
FOREIGN KEY (organization_id)
REFERENCES organizations(id)
ON DELETE SET NULL;

-- Verification queries:
-- Count notifications by organization
SELECT
    o.name as organization_name,
    COUNT(vn.id) as notification_count
FROM vehiclenotification vn
LEFT JOIN organizations o ON vn.organization_id = o.id
GROUP BY o.name
ORDER BY notification_count DESC;

-- Check notifications without organization_id
SELECT COUNT(*) as orphaned_notifications
FROM vehiclenotification
WHERE organization_id IS NULL AND deleted_at IS NULL;
