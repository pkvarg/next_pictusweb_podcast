-- CreateEnum
CREATE TYPE "Product" AS ENUM ('FLEETSYNC', 'PICDOCS');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "product" "Product" NOT NULL DEFAULT 'FLEETSYNC';

-- CreateTable
CREATE TABLE "picdocs_orgs" (
    "organization_id" TEXT NOT NULL,
    "doklado_api_key_enc" TEXT,
    "doklado_organization_id" VARCHAR(50) NOT NULL,
    "recipient_email" VARCHAR(255) NOT NULL,
    "runs_this_hour" INTEGER NOT NULL DEFAULT 0,
    "rate_window_start" TIMESTAMP(3),
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "picdocs_orgs_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "picdocs_runs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "status" VARCHAR(20) NOT NULL,
    "processed_count" INTEGER NOT NULL DEFAULT 0,
    "flagged_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "picdocs_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "picdocs_runs_organization_id_idx" ON "picdocs_runs"("organization_id");

-- CreateIndex
CREATE INDEX "picdocs_runs_status_idx" ON "picdocs_runs"("status");

-- AddForeignKey
ALTER TABLE "picdocs_orgs" ADD CONSTRAINT "picdocs_orgs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picdocs_runs" ADD CONSTRAINT "picdocs_runs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picdocs_runs" ADD CONSTRAINT "picdocs_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

