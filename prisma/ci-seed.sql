-- Minimal seed for CI integration tests: the CarCare itests need at least one
-- organization to exist (they create their own users/vehicles/events per test).
INSERT INTO organizations (id, name, created_at, updated_at)
SELECT gen_random_uuid()::text, 'CI Test Org', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations);
