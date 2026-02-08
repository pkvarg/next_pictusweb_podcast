-- Drop value column from notification_type_options table
ALTER TABLE "notification_type_options" DROP COLUMN "value";

-- Drop value column from notification_channel_options table
ALTER TABLE "notification_channel_options" DROP COLUMN "value";
