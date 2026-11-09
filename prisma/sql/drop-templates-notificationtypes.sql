-- Drop the legacy "notification templates" and "notification types" limit feature.
-- Unused by CarCare; no triggers were ever attached to these tables, so the
-- current_* counters were never maintained. Run against each environment's DB.
BEGIN;

-- 1. Drop the unused feature tables.
DROP TABLE IF EXISTS "notification_templates";
DROP TABLE IF EXISTS "notification_type_options";

-- 2. Drop the tier limit columns.
ALTER TABLE "tiers" DROP COLUMN IF EXISTS "templates_limit";
ALTER TABLE "tiers" DROP COLUMN IF EXISTS "notification_types_limit";

-- 3. Drop the org limit + counter columns.
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "templates_limit";
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "notification_types_limit";
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "current_templates_count";
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "current_notification_types_count";

-- 4. Rebuild the counts trigger function without the dropped-table branches.
CREATE OR REPLACE FUNCTION public.update_organization_counts()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'User' THEN
    UPDATE "organizations"
    SET "current_users_count" = (
      SELECT COUNT(*) FROM "User"
      WHERE "organization_id" = COALESCE(NEW."organization_id", OLD."organization_id")
        AND "deletedAt" IS NULL
    )
    WHERE id = COALESCE(NEW."organization_id", OLD."organization_id");

  ELSIF TG_TABLE_NAME = 'my_vehicles' THEN
    UPDATE "organizations"
    SET "current_vehicles_count" = (
      SELECT COUNT(*) FROM "my_vehicles"
      WHERE "organization_id" = COALESCE(NEW."organization_id", OLD."organization_id")
        AND "deleted_at" IS NULL
    )
    WHERE id = COALESCE(NEW."organization_id", OLD."organization_id");

  ELSIF TG_TABLE_NAME = 'vehiclenotification' THEN
    IF TG_OP = 'DELETE' THEN
      UPDATE "organizations" o
      SET "current_notifications_count" = (
        SELECT COUNT(*) FROM "vehiclenotification" vn
        INNER JOIN "User" u ON vn."user_id" = u.id
        WHERE u."organization_id" = o.id
          AND vn."deleted_at" IS NULL
      )
      WHERE id IN (
        SELECT DISTINCT u."organization_id" FROM "User" u WHERE u.id = OLD."user_id"
      );
    ELSE
      UPDATE "organizations" o
      SET "current_notifications_count" = (
        SELECT COUNT(*) FROM "vehiclenotification" vn
        INNER JOIN "User" u ON vn."user_id" = u.id
        WHERE u."organization_id" = o.id
          AND vn."deleted_at" IS NULL
      )
      WHERE id IN (
        SELECT DISTINCT u."organization_id" FROM "User" u WHERE u.id IN (NEW."user_id", OLD."user_id")
      );
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

COMMIT;
