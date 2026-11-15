-- Fix benefit sub-orgs orphaned by a parent that was deleted before the parent-delete cascade
-- existed (e.g. the removed PICTUSACI org). A benefit sub-org has no meaning without its parent,
-- so soft-delete any whose parent is missing or already soft-deleted, and deactivate their users.
UPDATE "organizations" sub
SET "deleted_at" = now()
WHERE sub."is_benefit_org" = true
  AND sub."deleted_at" IS NULL
  AND (
    sub."parent_organization_id" IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM "organizations" p
      WHERE p."id" = sub."parent_organization_id" AND p."deleted_at" IS NULL
    )
  );

UPDATE "users" u
SET "active" = false
WHERE u."active" = true
  AND EXISTS (
    SELECT 1 FROM "organizations" sub
    WHERE sub."id" = u."organization_id"
      AND sub."is_benefit_org" = true
      AND sub."deleted_at" IS NOT NULL
  );
