-- AlterTable: Add confirmation token fields to vehiclenotification
ALTER TABLE "vehiclenotification" ADD COLUMN IF NOT EXISTS "confirmationToken" VARCHAR(64),
ADD COLUMN IF NOT EXISTS "tokenExpiresAt" TIMESTAMP(3);

-- CreateIndex: Add unique constraint for confirmation token
CREATE UNIQUE INDEX IF NOT EXISTS "VehicleNotification_confirmationToken_key" ON "vehiclenotification"("confirmationToken");
