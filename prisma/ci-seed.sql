-- Minimal seed for CI integration tests: the CarCare itests need at least one
-- organization AND a user attached to it (several suites look up
-- `user.findFirst({ where: { organizationId: { not: null } } })` in beforeAll).
-- They create their own vehicles/events per test.
INSERT INTO organizations (id, name, created_at, updated_at)
SELECT gen_random_uuid()::text, 'CI Test Org', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations);

INSERT INTO users (id, email, organization_id, "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  'ci-itest@example.com',
  (SELECT id FROM organizations ORDER BY created_at LIMIT 1),
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE organization_id IS NOT NULL);
