-- CreateTable: Add my_vehicles table
CREATE TABLE "my_vehicles" (
    "id" TEXT NOT NULL,
    "organization" VARCHAR(100) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "registration" VARCHAR(20) NOT NULL,
    "year" INTEGER,
    "image" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "my_vehicles_pkey" PRIMARY KEY ("id")
);
