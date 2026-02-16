-- Change User -> Organization foreign key from SET NULL to RESTRICT
-- This prevents deleting an organization that still has users
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_organization_id_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
