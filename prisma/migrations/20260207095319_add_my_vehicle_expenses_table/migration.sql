-- CreateTable: Add my_vehicle_expenses table with foreign key to my_vehicles
CREATE TABLE "my_vehicle_expenses" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "organization" VARCHAR(100) NOT NULL,
    "item" VARCHAR(200) NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "my_vehicle_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Add index on vehicle_id for faster lookups
CREATE INDEX "my_vehicle_expenses_vehicle_id_idx" ON "my_vehicle_expenses"("vehicle_id");

-- AddForeignKey: Add foreign key constraint with CASCADE delete
ALTER TABLE "my_vehicle_expenses" ADD CONSTRAINT "my_vehicle_expenses_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "my_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
