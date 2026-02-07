-- AlterTable: Add user_id to my_vehicles (mandatory)
ALTER TABLE "my_vehicles" ADD COLUMN "user_id" TEXT NOT NULL;

-- AlterTable: Add user_id to my_vehicle_expenses (mandatory)
ALTER TABLE "my_vehicle_expenses" ADD COLUMN "user_id" TEXT NOT NULL;

-- AlterTable: Add user_id to my_vehicle_mileage (mandatory)
ALTER TABLE "my_vehicle_mileage" ADD COLUMN "user_id" TEXT NOT NULL;

-- AlterTable: Add user_id to vehiclenotification (optional)
ALTER TABLE "vehiclenotification" ADD COLUMN "user_id" TEXT;

-- CreateIndex
CREATE INDEX "my_vehicles_user_id_idx" ON "my_vehicles"("user_id");

-- CreateIndex
CREATE INDEX "my_vehicle_expenses_user_id_idx" ON "my_vehicle_expenses"("user_id");

-- CreateIndex
CREATE INDEX "my_vehicle_mileage_user_id_idx" ON "my_vehicle_mileage"("user_id");

-- CreateIndex
CREATE INDEX "vehiclenotification_user_id_idx" ON "vehiclenotification"("user_id");

-- AddForeignKey
ALTER TABLE "my_vehicles" ADD CONSTRAINT "my_vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "my_vehicle_expenses" ADD CONSTRAINT "my_vehicle_expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "my_vehicle_mileage" ADD CONSTRAINT "my_vehicle_mileage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiclenotification" ADD CONSTRAINT "vehiclenotification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
