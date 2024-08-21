/*
  Warnings:

  - Made the column `deleted` on table `Podcast` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Podcast" ALTER COLUMN "deleted" SET NOT NULL,
ALTER COLUMN "deleted" SET DEFAULT false;
