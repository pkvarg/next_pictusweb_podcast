-- Seed CarCare event templates (Slovak obligations + universal). Idempotent on key.
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
