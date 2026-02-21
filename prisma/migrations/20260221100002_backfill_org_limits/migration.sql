-- Backfill organization limits from their tier
UPDATE organizations o
SET users_limit = t.users_limit,
    vehicles_limit = t.vehicles_limit,
    notifications_limit = t.notifications_limit,
    templates_limit = t.templates_limit,
    notification_types_limit = t.notification_types_limit
FROM tiers t
WHERE o.tier_id = t.id;
