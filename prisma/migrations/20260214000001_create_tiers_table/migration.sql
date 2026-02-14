-- CreateTable
CREATE TABLE "tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "users_limit" INTEGER NOT NULL,
    "vehicles_limit" INTEGER NOT NULL,
    "notifications_limit" INTEGER NOT NULL,
    "templates_limit" INTEGER NOT NULL,
    "notification_types_limit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tiers_name_key" ON "tiers"("name");

-- CreateIndex
CREATE INDEX "idx_tiers_name" ON "tiers"("name");

-- CreateIndex
CREATE INDEX "idx_tiers_deleted_at" ON "tiers"("deleted_at");
