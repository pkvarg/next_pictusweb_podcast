-- AlterTable: Add benefit fields to User
ALTER TABLE "User" ADD COLUMN "is_benefit" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "benefit_parent_org_id" UUID;
ALTER TABLE "User" ADD COLUMN "benefit_gdpr_accepted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "benefit_gdpr_accepted_at" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "benefit_terms_accepted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "benefit_terms_accepted_at" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "benefit_activation_token" TEXT;

-- CreateIndex: Unique constraint on benefit_activation_token
CREATE UNIQUE INDEX "User_benefit_activation_token_key" ON "User"("benefit_activation_token");

-- AlterTable: Add isBenefitOrg to Organization
ALTER TABLE "organizations" ADD COLUMN "is_benefit_org" BOOLEAN NOT NULL DEFAULT false;
