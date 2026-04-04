-- AlterTable
ALTER TABLE "invoices" ADD COLUMN "payment_type" VARCHAR(20) NOT NULL DEFAULT 'stripe';
