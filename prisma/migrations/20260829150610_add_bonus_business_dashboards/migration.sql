-- Gift business dashboards to a non-business org
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "bonus_business_dashboards" BOOLEAN NOT NULL DEFAULT false;
