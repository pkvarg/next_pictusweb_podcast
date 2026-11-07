-- AlterTable
ALTER TABLE "event_templates" ADD COLUMN     "interval_days" INTEGER;

-- AlterTable
ALTER TABLE "recurring_events" ADD COLUMN     "interval_days" INTEGER;

