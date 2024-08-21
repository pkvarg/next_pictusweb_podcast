/*
  Warnings:

  - Added the required column `textPrompt` to the `Podcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "imagePrompt" TEXT,
ADD COLUMN     "textPrompt" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UsedImages" (
    "id" TEXT NOT NULL,
    "podcastTitle" TEXT,
    "imagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsedImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsedPodcasts" (
    "id" TEXT NOT NULL,
    "podcastTitle" TEXT,
    "audioPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsedPodcasts_pkey" PRIMARY KEY ("id")
);
