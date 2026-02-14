-- Fixed Migration: VehicleNotification table - Fix organization_id type and drop columns
-- This migration:
-- 1. Drops the incorrectly typed organization_id column (UUID)
-- 2. Creates organization_id as TEXT to match organizations.id
-- 3. Maps notifications to organizations via my_vehicle_id
-- 4. Drops sheetRowId column
-- 5. Drops vehicleType column (use myVehicle.type instead)

-- Step 1: Drop the existing organization_id column (wrong type)
ALTER TABLE vehiclenotification
DROP COLUMN IF EXISTS organization_id;

-- Step 2: Add organization_id column as TEXT (to match organizations.id)
ALTER TABLE vehiclenotification
ADD COLUMN organization_id TEXT;

-- Step 3: Map notifications to organizations through their vehicles
-- For notifications linked to vehicles, use the vehicle's organization
UPDATE vehiclenotification vn
SET organization_id = mv.organization_id
FROM my_vehicles mv
WHERE vn.my_vehicle_id = mv.id
AND vn.organization_id IS NULL;

-- Step 4: Check for unmapped notifications (for logging purposes)
SELECT
    id,
    "personName",
    "vehicleRegistration",
    "dutyDate",
    'No vehicle link - cannot determine organization' as issue
FROM vehiclenotification
WHERE organization_id IS NULL
AND deleted_at IS NULL
LIMIT 10;

-- Step 5: Drop the old columns
-- Drop sheetRowId (no longer used)
ALTER TABLE vehiclenotification
DROP COLUMN IF EXISTS "sheetRowId";

-- Drop vehicleType (use myVehicle.type instead through join)
ALTER TABLE vehiclenotification
DROP COLUMN IF EXISTS "vehicleType";

-- Step 6: Add index on organization_id for better query performance
DROP INDEX IF EXISTS idx_vehiclenotification_organization_id;
CREATE INDEX idx_vehiclenotification_organization_id
ON vehiclenotification(organization_id);

-- Step 7: Add foreign key constraint (TEXT to TEXT)
ALTER TABLE vehiclenotification
DROP CONSTRAINT IF EXISTS fk_vehiclenotification_organization;

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
WHERE vn.deleted_at IS NULL
GROUP BY o.name
ORDER BY notification_count DESC;

-- Check notifications without organization_id
SELECT COUNT(*) as orphaned_notifications
FROM vehiclenotification
WHERE organization_id IS NULL AND deleted_at IS NULL;
