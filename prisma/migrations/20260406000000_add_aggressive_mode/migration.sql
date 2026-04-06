-- AlterTable
ALTER TABLE "vehiclenotification"
  ADD COLUMN "is_aggressive_mode" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "aggressive_start" TIMESTAMP(3),
  ADD COLUMN "aggressive_end" TIMESTAMP(3),
  ADD COLUMN "aggressive_days_sent" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "vehiclenotification_is_aggressive_mode_idx" ON "vehiclenotification"("is_aggressive_mode");
