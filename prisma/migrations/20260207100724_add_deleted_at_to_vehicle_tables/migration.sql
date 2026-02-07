-- AlterTable: Add deleted_at column to my_vehicles
ALTER TABLE "my_vehicles" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- AlterTable: Add deleted_at column to my_vehicle_expenses
ALTER TABLE "my_vehicle_expenses" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- AlterTable: Add deleted_at column to my_vehicle_mileage
ALTER TABLE "my_vehicle_mileage" ADD COLUMN "deleted_at" TIMESTAMP(3);
