-- Tyre events carry a stable tyre dimension (e.g. "205/55 R16") that should persist
-- across seasons, so it lives on the recurring event rather than a single occurrence.
ALTER TABLE "recurring_events" ADD COLUMN IF NOT EXISTS "tyre_size" VARCHAR(40);
