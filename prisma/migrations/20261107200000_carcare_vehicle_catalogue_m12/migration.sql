-- CreateEnum
CREATE TYPE "Powertrain" AS ENUM ('PETROL', 'DIESEL', 'MHEV', 'HEV', 'PHEV', 'BEV', 'LPG', 'CNG', 'HYDROGEN', 'OTHER');

-- AlterTable
ALTER TABLE "my_vehicles" ADD COLUMN     "country" VARCHAR(2),
ADD COLUMN     "make" VARCHAR(60),
ADD COLUMN     "model" VARCHAR(60),
ADD COLUMN     "nickname" VARCHAR(100),
ADD COLUMN     "powertrain" "Powertrain",
ADD COLUMN     "vin" VARCHAR(20);

-- CreateTable
CREATE TABLE "vehicle_catalogue" (
    "id" TEXT NOT NULL,
    "make" VARCHAR(60) NOT NULL,
    "model" VARCHAR(60) NOT NULL,
    "powertrain" "Powertrain",
    "year_from" INTEGER,
    "year_to" INTEGER,

    CONSTRAINT "vehicle_catalogue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicle_catalogue_make_idx" ON "vehicle_catalogue"("make");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_catalogue_make_model_powertrain_key" ON "vehicle_catalogue"("make", "model", "powertrain");


-- Minimal make/model catalogue seed (expand later / via data import)
INSERT INTO "vehicle_catalogue" ("id","make","model","powertrain","year_from") VALUES
 (gen_random_uuid(),'Škoda','Octavia','DIESEL',2013),
 (gen_random_uuid(),'Škoda','Octavia','PETROL',2013),
 (gen_random_uuid(),'Škoda','Fabia','PETROL',2015),
 (gen_random_uuid(),'Volkswagen','Golf','PETROL',2012),
 (gen_random_uuid(),'Volkswagen','Passat','DIESEL',2014),
 (gen_random_uuid(),'Kia','Sportage','PETROL',2016),
 (gen_random_uuid(),'Toyota','Corolla','HEV',2019),
 (gen_random_uuid(),'Tesla','Model 3','BEV',2019),
 (gen_random_uuid(),'Hyundai','Tucson','PHEV',2021),
 (gen_random_uuid(),'BMW','320d','DIESEL',2015);
