-- Seed for CI integration tests. CI builds the schema with `prisma db push`, which does NOT
-- run migration data-inserts or create extensions, so we reproduce the reference data the
-- itests rely on: the unaccent extension (catalogue search), an org + a user attached to it
-- (several suites look up user.findFirst({ organizationId not null }) in beforeAll), the Slovak
-- event templates, and the make/model catalogue. Idempotent so re-runs are safe.

CREATE EXTENSION IF NOT EXISTS unaccent;

INSERT INTO organizations (id, name, created_at, updated_at)
SELECT gen_random_uuid()::text, 'CI Test Org', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations);

INSERT INTO users (id, email, organization_id, "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  'ci-itest@example.com',
  (SELECT id FROM organizations ORDER BY created_at LIMIT 1),
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE organization_id IS NOT NULL);

-- CarCare event templates (Slovak obligations + universal). Mirrors migration m13.
INSERT INTO "event_templates"
  ("id","key","category","country","powertrains","kind","action_type","recurrence_type",
   "interval_months","interval_days","interval_km","seasonal_month","seasonal_day","default_lead_days","active","created_at","updated_at")
VALUES
 (gen_random_uuid(),'stk','inspection','SK','{}','LEGAL','INSPECT','FIXED_INTERVAL',24,NULL,NULL,NULL,NULL,30,true,now(),now()),
 (gen_random_uuid(),'ek','inspection','SK','{PETROL,DIESEL,MHEV,HEV,PHEV,LPG,CNG}','LEGAL','INSPECT','FIXED_INTERVAL',24,NULL,NULL,NULL,NULL,30,true,now(),now()),
 (gen_random_uuid(),'pzp','insurance','SK','{}','LEGAL','RENEW','FIXED_INTERVAL',12,NULL,NULL,NULL,NULL,30,true,now(),now()),
 (gen_random_uuid(),'comprehensive_insurance','insurance',NULL,'{}','RECOMMENDED','RENEW','FIXED_INTERVAL',12,NULL,NULL,NULL,NULL,30,true,now(),now()),
 (gen_random_uuid(),'winter_tyres','tyres',NULL,'{}','RECOMMENDED','BOOK','SEASONAL',NULL,NULL,NULL,11,1,21,true,now(),now()),
 (gen_random_uuid(),'summer_tyres','tyres',NULL,'{}','RECOMMENDED','BOOK','SEASONAL',NULL,NULL,NULL,4,1,21,true,now(),now()),
 (gen_random_uuid(),'regular_service','service',NULL,'{}','RECOMMENDED','BOOK','DATE_OR_MILEAGE',12,NULL,15000,NULL,NULL,21,true,now(),now()),
 (gen_random_uuid(),'highway_vignette','vignette','SK','{}','RECOMMENDED','PURCHASE','FIXED_INTERVAL',12,NULL,NULL,NULL,NULL,14,true,now(),now()),
 (gen_random_uuid(),'parking_permit','permit',NULL,'{}','RECOMMENDED','RENEW','FIXED_INTERVAL',12,NULL,NULL,NULL,NULL,14,true,now(),now()),
 (gen_random_uuid(),'warranty','warranty',NULL,'{}','RECOMMENDED','INSPECT','ONE_TIME',NULL,NULL,NULL,NULL,NULL,30,true,now(),now()),
 (gen_random_uuid(),'battery_warranty','warranty',NULL,'{BEV,PHEV}','RECOMMENDED','INSPECT','ONE_TIME',NULL,NULL,NULL,NULL,NULL,30,true,now(),now()),
 (gen_random_uuid(),'charging_subscription','subscription',NULL,'{BEV,PHEV}','RECOMMENDED','RENEW','FIXED_INTERVAL',12,NULL,NULL,NULL,NULL,14,true,now(),now())
ON CONFLICT ("key") DO NOTHING;

-- Make/model catalogue. Mirrors migration m12.
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
 (gen_random_uuid(),'BMW','320d','DIESEL',2015)
ON CONFLICT ("make","model","powertrain") DO NOTHING;
