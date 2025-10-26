-- CreateTable
CREATE TABLE "BotLog" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "honeypot" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "timeSpent" INTEGER,
    "detectionType" TEXT NOT NULL,
    "detectionDetails" TEXT,
    "locale" TEXT,
    "origin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotLog_pkey" PRIMARY KEY ("id")
);
