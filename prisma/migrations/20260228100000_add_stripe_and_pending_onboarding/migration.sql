-- AlterTable: Add Stripe billing fields to organizations
ALTER TABLE "organizations" ADD COLUMN "stripe_customer_id" VARCHAR(100);
ALTER TABLE "organizations" ADD COLUMN "stripe_subscription_id" VARCHAR(100);
ALTER TABLE "organizations" ADD COLUMN "stripe_subscription_status" VARCHAR(30);
ALTER TABLE "organizations" ADD COLUMN "billing_interval" VARCHAR(10);
ALTER TABLE "organizations" ADD COLUMN "subscription_start_date" TIMESTAMP(3);
ALTER TABLE "organizations" ADD COLUMN "subscription_end_date" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_stripe_customer_id_key" ON "organizations"("stripe_customer_id");
CREATE UNIQUE INDEX "organizations_stripe_subscription_id_key" ON "organizations"("stripe_subscription_id");

-- AlterTable: Add invoicing/business fields to organizations
ALTER TABLE "organizations" ADD COLUMN "ico" VARCHAR(20);
ALTER TABLE "organizations" ADD COLUMN "dic" VARCHAR(20);
ALTER TABLE "organizations" ADD COLUMN "street" VARCHAR(200);
ALTER TABLE "organizations" ADD COLUMN "city" VARCHAR(100);
ALTER TABLE "organizations" ADD COLUMN "postal_code" VARCHAR(20);
ALTER TABLE "organizations" ADD COLUMN "country" VARCHAR(100);

-- AlterTable: Add Stripe price IDs and yearly discount to tiers
ALTER TABLE "tiers" ADD COLUMN "stripe_price_monthly" VARCHAR(100);
ALTER TABLE "tiers" ADD COLUMN "stripe_price_yearly" VARCHAR(100);
ALTER TABLE "tiers" ADD COLUMN "yearly_discount" DECIMAL(4,2);
UPDATE "tiers" SET yearly_discount = 0.83;

-- AlterTable: Add phone_verified to User
ALTER TABLE "User" ADD COLUMN "phone_verified" TIMESTAMP(3);

-- CreateTable: PendingOnboarding
CREATE TABLE "pending_onboarding" (
    "id" TEXT NOT NULL,
    "organization_name" VARCHAR(100) NOT NULL,
    "organization_contact" VARCHAR(100),
    "tier_id" TEXT NOT NULL,
    "purchased_vehicles" INTEGER NOT NULL DEFAULT 1,
    "billing_interval" VARCHAR(10) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" VARCHAR(20),
    "ico" VARCHAR(20),
    "dic" VARCHAR(20),
    "street" VARCHAR(200),
    "city" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "gdpr_accepted" BOOLEAN NOT NULL DEFAULT false,
    "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
    "gdpr_accepted_at" TIMESTAMP(3),
    "terms_accepted_at" TIMESTAMP(3),
    "stripe_session_id" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_onboarding_email_key" ON "pending_onboarding"("email");
CREATE UNIQUE INDEX "pending_onboarding_stripe_session_id_key" ON "pending_onboarding"("stripe_session_id");

-- AddForeignKey
ALTER TABLE "pending_onboarding" ADD CONSTRAINT "pending_onboarding_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
