-- AlterTable
ALTER TABLE "vehiclenotification" ADD COLUMN "pdr_reminder_for" VARCHAR(50),
ADD COLUMN "renewed_from_batch_id" VARCHAR(50);

-- CreateTable
CREATE TABLE "duty_renewal_presets" (
    "id" TEXT NOT NULL,
    "notification_type_id" TEXT,
    "notification_type_label" VARCHAR(50),
    "organization_id" TEXT NOT NULL,
    "preset_months" VARCHAR(100) NOT NULL,
    "preset_labels" VARCHAR(255) NOT NULL,
    "default_preset_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "duty_renewal_presets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehiclenotification_pdr_reminder_for_idx" ON "vehiclenotification"("pdr_reminder_for");

-- CreateIndex
CREATE INDEX "vehiclenotification_renewed_from_batch_id_idx" ON "vehiclenotification"("renewed_from_batch_id");

-- CreateIndex
CREATE INDEX "duty_renewal_presets_organization_id_idx" ON "duty_renewal_presets"("organization_id");

-- CreateIndex
CREATE INDEX "duty_renewal_presets_notification_type_id_idx" ON "duty_renewal_presets"("notification_type_id");

-- AddForeignKey
ALTER TABLE "duty_renewal_presets" ADD CONSTRAINT "duty_renewal_presets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
