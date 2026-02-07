-- AlterTable: Add optional my_vehicle_id to vehiclenotification
ALTER TABLE "vehiclenotification" ADD COLUMN "my_vehicle_id" TEXT;

-- CreateIndex
CREATE INDEX "vehiclenotification_my_vehicle_id_idx" ON "vehiclenotification"("my_vehicle_id");

-- AddForeignKey
ALTER TABLE "vehiclenotification" ADD CONSTRAINT "vehiclenotification_my_vehicle_id_fkey" FOREIGN KEY ("my_vehicle_id") REFERENCES "my_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
