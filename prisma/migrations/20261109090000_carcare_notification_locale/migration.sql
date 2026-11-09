-- AlterTable: account-level language for notification content (sk | en | hu)
ALTER TABLE "organizations" ADD COLUMN "notification_locale" TEXT NOT NULL DEFAULT 'sk';
