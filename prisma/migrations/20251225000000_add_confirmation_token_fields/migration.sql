-- AlterTable: Add confirmation token fields to vehiclenotification
ALTER TABLE "vehiclenotification" ADD COLUMN IF NOT EXISTS "confirmation_token" VARCHAR(64),
ADD COLUMN IF NOT EXISTS "token_expires_at" TIMESTAMP(3);

-- CreateIndex: Add unique constraint for confirmation token
CREATE UNIQUE INDEX IF NOT EXISTS "vehiclenotification_confirmation_token_key" ON "vehiclenotification"("confirmation_token");
