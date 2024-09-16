/*
  Warnings:

  - Made the column `published` on table `Podcast` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Podcast" ALTER COLUMN "published" SET NOT NULL,
ALTER COLUMN "published" SET DEFAULT false;
