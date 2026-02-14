-- Seed initial tier data
INSERT INTO "tiers" (name, users_limit, vehicles_limit, notifications_limit, templates_limit, notification_types_limit)
VALUES
  ('FREE', 5, 10, 100, 5, 10),
  ('PREMIUM', 25, 50, 1000, 20, 30),
  ('BUSINESS', 100, 200, 10000, 50, 100);
