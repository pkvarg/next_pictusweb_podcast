-- Initialize all organization counts based on existing data
UPDATE "organizations" o
SET
  "current_users_count" = (
    SELECT COUNT(*) FROM "User"
    WHERE "organization_id" = o.id AND "deletedAt" IS NULL
  ),
  "current_vehicles_count" = (
    SELECT COUNT(*) FROM "my_vehicles"
    WHERE "organization_id" = o.id AND "deleted_at" IS NULL
  ),
  "current_notifications_count" = (
    SELECT COUNT(*) FROM "vehiclenotification" vn
    INNER JOIN "User" u ON vn."user_id" = u.id
    WHERE u."organization_id" = o.id AND vn."deleted_at" IS NULL
  ),
  "current_templates_count" = (
    SELECT COUNT(*) FROM "notification_templates"
    WHERE "organization_id" = o.id AND "deleted_at" IS NULL
  ),
  "current_notification_types_count" = (
    SELECT COUNT(*) FROM "notification_type_options"
    WHERE "organization_id" = o.id AND "deleted_at" IS NULL
  );
