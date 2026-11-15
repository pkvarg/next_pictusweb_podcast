-- The PICTUSACI cross-org "see all vehicles" feature and its admin toggle were removed.
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "hidden_from_pictusaci";
