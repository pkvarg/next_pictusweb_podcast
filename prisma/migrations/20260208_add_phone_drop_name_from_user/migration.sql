-- AlterTable User - Add phone_number column
ALTER TABLE "User" ADD COLUMN "phone_number" VARCHAR(20);

-- AlterTable User - Drop name column
ALTER TABLE "User" DROP COLUMN "name";
