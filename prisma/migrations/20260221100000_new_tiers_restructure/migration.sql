-- Tiers: add pricePerVehicle
ALTER TABLE "tiers" ADD COLUMN "price_per_vehicle" DECIMAL(10,2);

-- Organizations: add limit overrides, purchasedVehicles, hiddenFromPictusaci
ALTER TABLE "organizations" ADD COLUMN "users_limit" INTEGER;
ALTER TABLE "organizations" ADD COLUMN "vehicles_limit" INTEGER;
ALTER TABLE "organizations" ADD COLUMN "notifications_limit" INTEGER;
ALTER TABLE "organizations" ADD COLUMN "templates_limit" INTEGER;
ALTER TABLE "organizations" ADD COLUMN "notification_types_limit" INTEGER;
ALTER TABLE "organizations" ADD COLUMN "purchased_vehicles" INTEGER;
ALTER TABLE "organizations" ADD COLUMN "hidden_from_pictusaci" BOOLEAN NOT NULL DEFAULT false;

-- Expenses: add note and link
ALTER TABLE "my_vehicle_expenses" ADD COLUMN "note" VARCHAR(500);
ALTER TABLE "my_vehicle_expenses" ADD COLUMN "link" VARCHAR(500);
