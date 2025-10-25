-- AlterTable: Add confirmation token columns to vehiclenotification
ALTER TABLE "vehiclenotification" ADD COLUMN IF NOT EXISTS "confirmation_token" VARCHAR(64),
ADD COLUMN IF NOT EXISTS "token_expires_at" TIMESTAMP(3);

-- CreateIndex: Add unique constraint and index for faster token lookups
CREATE UNIQUE INDEX IF NOT EXISTS "vehiclenotification_confirmation_token_key" ON "vehiclenotification"("confirmation_token");

-- AddComment
COMMENT ON COLUMN "vehiclenotification"."confirmation_token" IS 'Unique token for secure confirmation link';
COMMENT ON COLUMN "vehiclenotification"."token_expires_at" IS 'Token expiration timestamp (7 days from creation)';
