-- Add opt-in notification settings to organizations
ALTER TABLE "organizations"
  ADD COLUMN IF NOT EXISTS "use_custom_templates" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "confirm_notification_creation" BOOLEAN NOT NULL DEFAULT false;
