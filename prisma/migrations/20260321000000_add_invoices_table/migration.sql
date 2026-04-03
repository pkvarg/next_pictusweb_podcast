-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" VARCHAR(20) NOT NULL,
    "organization_name" VARCHAR(100) NOT NULL,
    "street" VARCHAR(200),
    "city" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "ico" VARCHAR(20),
    "dic" VARCHAR(20),
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "tier" VARCHAR(20) NOT NULL,
    "billing" VARCHAR(10) NOT NULL,
    "number_of_vehicles" INTEGER NOT NULL,
    "price_per_vehicle" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
