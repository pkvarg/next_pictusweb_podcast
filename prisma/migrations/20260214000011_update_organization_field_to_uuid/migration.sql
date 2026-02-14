-- Update the old organization field to contain UUID instead of name
-- This makes it consistent with organization_id field

-- User table - update organization to UUID
UPDATE "User" u
SET organization = o.id
FROM "organizations" o
WHERE u.organization = o.name
  AND u.organization IS NOT NULL;

-- My Vehicles table - update organization to UUID
UPDATE "my_vehicles" mv
SET organization = o.id
FROM "organizations" o
WHERE mv.organization = o.name;

-- My Vehicle Expenses table - update organization to UUID
UPDATE "my_vehicle_expenses" mve
SET organization = o.id
FROM "organizations" o
WHERE mve.organization = o.name;

-- Notification Templates table - update organization to UUID
UPDATE "notification_templates" nt
SET organization = o.id
FROM "organizations" o
WHERE nt.organization = o.name;

-- Notification Type Options table - update organization to UUID
UPDATE "notification_type_options" nto
SET organization = o.id
FROM "organizations" o
WHERE nto.organization = o.name;

-- Notification Channel Options table - update organization to UUID
UPDATE "notification_channel_options" nco
SET organization = o.id
FROM "organizations" o
WHERE nco.organization = o.name;
