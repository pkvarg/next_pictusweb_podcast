-- Phase 4: Add is_pdr and duty_batch_id to vehiclenotification
ALTER TABLE "vehiclenotification" ADD COLUMN "is_pdr" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "vehiclenotification" ADD COLUMN "duty_batch_id" VARCHAR(50);

-- Create indexes for the new fields
CREATE INDEX "idx_vehiclenotification_duty_batch_id" ON "vehiclenotification"("duty_batch_id");
CREATE INDEX "idx_vehiclenotification_is_pdr" ON "vehiclenotification"("is_pdr");

-- Phase 5: Add is_pdr, deleted_at, and updated_at to notification_type_options
ALTER TABLE "notification_type_options" ADD COLUMN "is_pdr" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "notification_type_options" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "notification_type_options" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create indexes
CREATE INDEX "idx_notification_type_options_is_pdr" ON "notification_type_options"("is_pdr");
CREATE INDEX "idx_notification_type_options_deleted_at" ON "notification_type_options"("deleted_at");

-- Phase 6: Add deleted_at to notification_templates
ALTER TABLE "notification_templates" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Create index
CREATE INDEX "idx_notification_templates_deleted_at" ON "notification_templates"("deleted_at");
