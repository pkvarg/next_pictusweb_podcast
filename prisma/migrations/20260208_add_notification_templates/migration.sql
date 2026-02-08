-- CreateTable
CREATE TABLE IF NOT EXISTS "notification_templates" (
    "id" TEXT NOT NULL,
    "organization" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "notificationType" VARCHAR(50) NOT NULL,
    "notificationChannel" VARCHAR(50) NOT NULL,
    "daysBeforeDuty" INTEGER,
    "emailMessage" TEXT,
    "smsMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notification_type_options" (
    "id" TEXT NOT NULL,
    "organization" VARCHAR(100) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "value" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_type_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notification_channel_options" (
    "id" TEXT NOT NULL,
    "organization" VARCHAR(100) NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "value" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_channel_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notification_templates_organization_idx" ON "notification_templates"("organization");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notification_type_options_organization_idx" ON "notification_type_options"("organization");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notification_channel_options_organization_idx" ON "notification_channel_options"("organization");
