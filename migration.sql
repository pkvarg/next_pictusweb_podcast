-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PREMIUM');

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "media" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "upcoming" BOOLEAN NOT NULL,
    "english" BOOLEAN NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Podcast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "audioPath" TEXT NOT NULL,
    "imagePath" TEXT,
    "category" TEXT,
    "english" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imagePrompt" TEXT,
    "textPrompt" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "voiceType" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsedImages" (
    "id" TEXT NOT NULL,
    "podcastTitle" TEXT,
    "imagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reallyUsed" BOOLEAN,

    CONSTRAINT "UsedImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsedPodcasts" (
    "id" TEXT NOT NULL,
    "podcastTitle" TEXT,
    "audioPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reallyUsed" BOOLEAN,

    CONSTRAINT "UsedPodcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorsCounter" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorsCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "loginProvider" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "organization" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "lastLoggedIn" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiclenotification" (
    "id" SERIAL NOT NULL,
    "company" VARCHAR(100),
    "personName" VARCHAR(100),
    "email" VARCHAR(150),
    "phoneNumber" VARCHAR(150),
    "vehicleRegistration" VARCHAR(20),
    "vehicleType" VARCHAR(100),
    "notificationType" VARCHAR(50),
    "notificationChannel" VARCHAR(50),
    "notificationDate" TIMESTAMP(3),
    "dutyDate" TIMESTAMP(3),
    "emailMessage" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "emailSentAt" TIMESTAMP(3),
    "smsSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sheetRowId" VARCHAR(50),
    "confirmationAttempts" INTEGER NOT NULL DEFAULT 0,
    "confirmedAt" TIMESTAMP(3),
    "lastReminderSent" TIMESTAMP(3),
    "finalStatusUpdated" TIMESTAMP(3),

    CONSTRAINT "vehiclenotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehiclenotification_sheetRowId_key" ON "vehiclenotification"("sheetRowId");

