-- Remove dead legacy models that are no longer part of the schema or used by code.
-- On main-cC these tables are already absent, so IF EXISTS makes this a no-op there;
-- it keeps migration history consistent for any environment that still has them.
DROP TABLE IF EXISTS "notification_channel_options";
DROP TABLE IF EXISTS "duty_renewal_presets";
