-- Mark an org as paid manually (yearly invoice / bank transfer, no Stripe)
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "manually_paid" BOOLEAN NOT NULL DEFAULT false;
