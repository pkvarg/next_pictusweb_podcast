-- AlterTable
ALTER TABLE "notification_templates" ADD COLUMN "reminderIntervals" JSONB;

-- Add comment to the column
COMMENT ON COLUMN "notification_templates"."reminderIntervals" IS 'Array of day offsets for reminder notifications. Negative = before duty date, 0 = on duty date, positive = after duty date. Example: [-30, -14, -7, 0, 1, 2]';

-- Add comment to deprecated column
COMMENT ON COLUMN "notification_templates"."daysBeforeDuty" IS 'DEPRECATED: Use reminderIntervals instead. Kept for backwards compatibility.';
