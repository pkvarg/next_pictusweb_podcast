-- CreateTable: Add my_vehicle_mileage table with foreign key to my_vehicles
CREATE TABLE "my_vehicle_mileage" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "kilometers" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "my_vehicle_mileage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Add index on vehicle_id for faster lookups
CREATE INDEX "my_vehicle_mileage_vehicle_id_idx" ON "my_vehicle_mileage"("vehicle_id");

-- AddForeignKey: Add foreign key constraint with CASCADE delete
ALTER TABLE "my_vehicle_mileage" ADD CONSTRAINT "my_vehicle_mileage_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "my_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
