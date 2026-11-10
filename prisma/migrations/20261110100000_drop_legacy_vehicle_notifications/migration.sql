-- Drop the legacy FleetSync notifications table.
-- Superseded by the CarCare model (recurring_events, event_occurrences,
-- notification_rules, notification_deliveries). All future-dated reminders were
-- migrated to that model before this drop. No other table references it.
DROP TABLE IF EXISTS "vehicle_notifications";
