-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "agent_consent_by" VARCHAR(255),
                            ADD COLUMN "agent_consent_at" TIMESTAMP(3);
