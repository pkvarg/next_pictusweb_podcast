-- AlterTable: Add isFleetManager column to User table
ALTER TABLE "User" ADD COLUMN "isFleetManager" BOOLEAN NOT NULL DEFAULT false;
