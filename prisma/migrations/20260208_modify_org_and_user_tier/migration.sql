-- AlterTable organizations - Add new columns
ALTER TABLE "organizations" ADD COLUMN "tier" TEXT,
ADD COLUMN "number_users" INTEGER,
ADD COLUMN "number_vehicles" INTEGER,
ADD COLUMN "number_notification_types" INTEGER;

-- AlterTable users - Drop tier column
ALTER TABLE "User" DROP COLUMN "tier";
