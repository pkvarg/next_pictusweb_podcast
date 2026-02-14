-- Add organization_id columns to all tables
ALTER TABLE "User" ADD COLUMN "organization_id" TEXT;
ALTER TABLE "my_vehicles" ADD COLUMN "organization_id" TEXT;
ALTER TABLE "my_vehicle_expenses" ADD COLUMN "organization_id" TEXT;
ALTER TABLE "my_vehicle_mileage" ADD COLUMN "organization_id" TEXT;
ALTER TABLE "notification_templates" ADD COLUMN "organization_id" TEXT;
ALTER TABLE "notification_type_options" ADD COLUMN "organization_id" TEXT;
ALTER TABLE "notification_channel_options" ADD COLUMN "organization_id" TEXT;

-- Add foreign key constraints
ALTER TABLE "User" ADD CONSTRAINT "fk_user_organization"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");

ALTER TABLE "my_vehicles" ADD CONSTRAINT "fk_vehicle_organization"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");

ALTER TABLE "my_vehicle_expenses" ADD CONSTRAINT "fk_expense_organization"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");

ALTER TABLE "my_vehicle_mileage" ADD CONSTRAINT "fk_mileage_organization"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");

ALTER TABLE "notification_templates" ADD CONSTRAINT "fk_template_organization"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");

ALTER TABLE "notification_type_options" ADD CONSTRAINT "fk_type_option_organization"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");

ALTER TABLE "notification_channel_options" ADD CONSTRAINT "fk_channel_option_organization"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");

-- Create indexes for fast lookups
CREATE INDEX "idx_users_organization_id" ON "User"("organization_id");
CREATE INDEX "idx_vehicles_organization_id" ON "my_vehicles"("organization_id");
CREATE INDEX "idx_expenses_organization_id" ON "my_vehicle_expenses"("organization_id");
CREATE INDEX "idx_mileage_organization_id" ON "my_vehicle_mileage"("organization_id");
CREATE INDEX "idx_templates_organization_id" ON "notification_templates"("organization_id");
CREATE INDEX "idx_type_options_organization_id" ON "notification_type_options"("organization_id");
CREATE INDEX "idx_channel_options_organization_id" ON "notification_channel_options"("organization_id");
