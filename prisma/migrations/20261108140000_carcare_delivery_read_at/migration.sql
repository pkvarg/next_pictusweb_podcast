-- AlterTable
ALTER TABLE "notification_deliveries" ADD COLUMN "read_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "notification_deliveries_recipient_user_id_channel_status_idx" ON "notification_deliveries"("recipient_user_id", "channel", "status");
