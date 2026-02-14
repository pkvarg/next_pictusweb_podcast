-- Composite indexes for common queries combining organization_id and deleted_at
CREATE INDEX IF NOT EXISTS "idx_users_org_deleted" ON "User"("organization_id", "deletedAt");
CREATE INDEX IF NOT EXISTS "idx_vehicles_org_deleted" ON "my_vehicles"("organization_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "idx_notifications_user_deleted" ON "vehiclenotification"("user_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "idx_templates_org_deleted" ON "notification_templates"("organization_id", "deleted_at");
CREATE INDEX IF NOT EXISTS "idx_type_options_org_deleted" ON "notification_type_options"("organization_id", "deleted_at");

-- Indexes for notification queries
CREATE INDEX IF NOT EXISTS "idx_notifications_status_date" ON "vehiclenotification"("status", "notificationDate");
CREATE INDEX IF NOT EXISTS "idx_notifications_duty_date" ON "vehiclenotification"("dutyDate");

-- Index for vehicle queries
CREATE INDEX IF NOT EXISTS "idx_vehicles_registration" ON "my_vehicles"("registration");
CREATE INDEX IF NOT EXISTS "idx_vehicles_user_deleted" ON "my_vehicles"("user_id", "deleted_at");

-- Indexes for expense and mileage queries
CREATE INDEX IF NOT EXISTS "idx_expenses_vehicle_date" ON "my_vehicle_expenses"("vehicle_id", "date");
CREATE INDEX IF NOT EXISTS "idx_mileage_vehicle_date" ON "my_vehicle_mileage"("vehicle_id", "date");
