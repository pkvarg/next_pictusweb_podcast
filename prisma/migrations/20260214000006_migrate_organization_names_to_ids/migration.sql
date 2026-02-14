-- Migrate organization names to organization_id for all tables

-- User table
UPDATE "User" u
SET "organization_id" = o.id
FROM "organizations" o
WHERE u.organization = o.name
  AND u.organization IS NOT NULL;

-- My Vehicles table
UPDATE "my_vehicles" mv
SET "organization_id" = o.id
FROM "organizations" o
WHERE mv.organization = o.name;

-- My Vehicle Expenses table
UPDATE "my_vehicle_expenses" mve
SET "organization_id" = o.id
FROM "organizations" o
WHERE mve.organization = o.name;

-- My Vehicle Mileage table (get organization from vehicle)
UPDATE "my_vehicle_mileage" mvm
SET "organization_id" = mv.organization_id
FROM "my_vehicles" mv
WHERE mvm.vehicle_id = mv.id
  AND mv.organization_id IS NOT NULL;

-- Notification Templates table
UPDATE "notification_templates" nt
SET "organization_id" = o.id
FROM "organizations" o
WHERE nt.organization = o.name;

-- Notification Type Options table
UPDATE "notification_type_options" nto
SET "organization_id" = o.id
FROM "organizations" o
WHERE nto.organization = o.name;

-- Notification Channel Options table
UPDATE "notification_channel_options" nco
SET "organization_id" = o.id
FROM "organizations" o
WHERE nco.organization = o.name;
