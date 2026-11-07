-- Normalize all table names to lowercase snake_case, plural.
-- RENAME preserves all data, indexes and foreign keys (FKs reference table OIDs).
ALTER TABLE "Blog"            RENAME TO blogs;
ALTER TABLE "Podcast"         RENAME TO podcasts;
ALTER TABLE "UsedImages"      RENAME TO used_images;
ALTER TABLE "UsedPodcasts"    RENAME TO used_podcasts;
ALTER TABLE "VisitorsCounter" RENAME TO visitors_counters;
ALTER TABLE "User"            RENAME TO users;
ALTER TABLE "BotLog"          RENAME TO bot_logs;
ALTER TABLE "ContactLog"      RENAME TO contact_logs;
ALTER TABLE vehiclenotification RENAME TO vehicle_notifications;
ALTER TABLE confirmation_log    RENAME TO confirmation_logs;
ALTER TABLE my_vehicle_mileage  RENAME TO my_vehicle_mileages;
ALTER TABLE pending_onboarding  RENAME TO pending_onboardings;
