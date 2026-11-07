-- AlterTable
ALTER TABLE "recurring_events" ADD COLUMN     "preferred_provider_id" TEXT;

-- AddForeignKey
ALTER TABLE "recurring_events" ADD CONSTRAINT "recurring_events_preferred_provider_id_fkey" FOREIGN KEY ("preferred_provider_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

