-- Create function to update organization counts
CREATE OR REPLACE FUNCTION update_organization_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counts based on which table triggered the function
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
    -- For notifications, need to get organization from user
    IF TG_OP = 'DELETE' THEN
      UPDATE "organizations" o
      SET "current_notifications_count" = (
        SELECT COUNT(*) FROM "vehiclenotification" vn
        INNER JOIN "User" u ON vn."user_id" = u.id
        WHERE u."organization_id" = o.id
          AND vn."deleted_at" IS NULL
      )
      WHERE id IN (
        SELECT DISTINCT u."organization_id"
        FROM "User" u
        WHERE u.id = OLD."user_id"
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
        SELECT DISTINCT u."organization_id"
        FROM "User" u
        WHERE u.id IN (NEW."user_id", OLD."user_id")
      );
    END IF;

  ELSIF TG_TABLE_NAME = 'notification_templates' THEN
    UPDATE "organizations"
    SET "current_templates_count" = (
      SELECT COUNT(*) FROM "notification_templates"
      WHERE "organization_id" = COALESCE(NEW."organization_id", OLD."organization_id")
        AND "deleted_at" IS NULL
    )
    WHERE id = COALESCE(NEW."organization_id", OLD."organization_id");

  ELSIF TG_TABLE_NAME = 'notification_type_options' THEN
    UPDATE "organizations"
    SET "current_notification_types_count" = (
      SELECT COUNT(*) FROM "notification_type_options"
      WHERE "organization_id" = COALESCE(NEW."organization_id", OLD."organization_id")
        AND "deleted_at" IS NULL
    )
    WHERE id = COALESCE(NEW."organization_id", OLD."organization_id");
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
CREATE TRIGGER trg_update_user_count
  AFTER INSERT OR UPDATE OR DELETE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_counts();

CREATE TRIGGER trg_update_vehicle_count
  AFTER INSERT OR UPDATE OR DELETE ON "my_vehicles"
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_counts();

CREATE TRIGGER trg_update_notification_count
  AFTER INSERT OR UPDATE OR DELETE ON "vehiclenotification"
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_counts();

CREATE TRIGGER trg_update_template_count
  AFTER INSERT OR UPDATE OR DELETE ON "notification_templates"
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_counts();

CREATE TRIGGER trg_update_notification_type_count
  AFTER INSERT OR UPDATE OR DELETE ON "notification_type_options"
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_counts();
