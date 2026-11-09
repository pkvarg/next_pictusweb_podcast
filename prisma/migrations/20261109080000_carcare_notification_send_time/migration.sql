-- AlterTable: account-level reminder send time (minute is 0 or 30)
ALTER TABLE "organizations" ADD COLUMN "notification_send_hour" INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "organizations" ADD COLUMN "notification_send_minute" INTEGER NOT NULL DEFAULT 30;
