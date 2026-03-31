-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "hybridPassword";

-- Update hybrid users to credentials
UPDATE "User" SET "loginProvider" = 'credentials' WHERE "loginProvider" = 'hybrid';
