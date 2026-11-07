-- CreateEnum
CREATE TYPE "GarageRole" AS ENUM ('OWNER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "garage_memberships" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "GarageRole" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "garage_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_access" (
    "id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "vehicle_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "garage_invitations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "GarageRole" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "invited_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "garage_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "garage_memberships_user_id_idx" ON "garage_memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "garage_memberships_organization_id_user_id_key" ON "garage_memberships"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "vehicle_access_vehicle_id_idx" ON "vehicle_access"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_access_membership_id_vehicle_id_key" ON "vehicle_access"("membership_id", "vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "garage_invitations_token_key" ON "garage_invitations"("token");

-- CreateIndex
CREATE INDEX "garage_invitations_organization_id_idx" ON "garage_invitations"("organization_id");

-- CreateIndex
CREATE INDEX "garage_invitations_email_idx" ON "garage_invitations"("email");

-- AddForeignKey
ALTER TABLE "garage_memberships" ADD CONSTRAINT "garage_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garage_memberships" ADD CONSTRAINT "garage_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_access" ADD CONSTRAINT "vehicle_access_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "garage_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_access" ADD CONSTRAINT "vehicle_access_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "my_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garage_invitations" ADD CONSTRAINT "garage_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

