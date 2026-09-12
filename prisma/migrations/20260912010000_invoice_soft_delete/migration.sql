-- Soft-delete invoices: keep the row, hide it, allow the number to be reused.
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deletion_reason" VARCHAR(500);

-- Drop the plain unique on invoice_number so a soft-deleted number can be reused.
DROP INDEX IF EXISTS "invoices_invoice_number_key";

-- Uniqueness now only applies to live (non-deleted) invoices.
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_invoice_number_active_key"
  ON "invoices" ("invoice_number")
  WHERE "deleted_at" IS NULL;

-- Non-unique lookup index (matches @@index in schema).
CREATE INDEX IF NOT EXISTS "invoices_invoice_number_idx" ON "invoices" ("invoice_number");
