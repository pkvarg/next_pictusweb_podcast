-- Rename PREMIUM to BASIC and seed price_per_vehicle
UPDATE "tiers" SET name = 'BASIC' WHERE name = 'PREMIUM';
UPDATE "tiers" SET price_per_vehicle = 0 WHERE name = 'FREE';
UPDATE "tiers" SET price_per_vehicle = 2.00 WHERE name = 'BASIC';
UPDATE "tiers" SET price_per_vehicle = 3.00 WHERE name = 'BUSINESS';
