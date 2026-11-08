# n8n_cC — published workflows corrected for the plural snake_case schema

Corrected copies of the **published (active)** n8n workflows from `notifications.pictusweb.sk` that query renamed tables, updated for milestone **M1** (branch `main-cC`). Only active workflows are kept here — inactive/archived/demo drafts are intentionally excluded.

## Table references rewritten (columns untouched)

| old table             | new table               |
| --------------------- | ----------------------- |
| `vehiclenotification` | `vehicle_notifications` |
| `confirmation_log`    | `confirmation_logs`     |

No other renamed table is referenced by any workflow. Tables the workflows use that were **not** renamed (`organizations`, `my_vehicles`, …) are unchanged.

## The 5 published workflows (local file → staged copy in n8n)

| local file                                     | original (live, active)                     | staged copy in n8n (unpublished)                    |
| ---------------------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| `Confirm.EHqNRf8nWA41I3iK.json`                | Confirm (`EHqNRf8nWA41I3iK`)                | `fleetsync_cC_Confirm` (`Cgcd1XMpR5JcX3wu`)         |
| `Today_pdr.JR7tNGWmMaiXb091.json`              | Today_pdr (`JR7tNGWmMaiXb091`)              | `fleetsync_cC_Today_pdr` (`h9x7sE5yGi3nz52j`)       |
| `Reminders_pdr.XkWNJrN6dXilZHRN.json`          | Reminders_pdr (`XkWNJrN6dXilZHRN`)          | `fleetsync_cC_Reminders_pdr` (`Y2iFGlL1SXFWjhsn`)   |
| `Aggressive_mode.geTf5bdTGbauev0S.json`        | Aggressive_mode (`geTf5bdTGbauev0S`)        | `fleetsync_cC_Aggressive_mode` (`ozfQMt6MgOneliht`) |
| `FLEETSYNC_Daily_Digest.cgmETsrQkI5PjN4K.json` | FLEETSYNC_Daily_Digest (`cgmETsrQkI5PjN4K`) | `fleetsync_cC_Daily_Digest` (`Jswhf5sXRoHzYPz9`)    |

The staged `fleetsync_cC_*` copies are created **inactive**. They point at the same credentials as the originals and carry the corrected SQL. They do nothing until activated.

## Cutover (do NOT activate until the prod table rename is applied)

n8n Postgres nodes query the DB directly, so these must go live **in lockstep** with the production table rename:

1. Apply the renames on prod (`../CARCARE_PROD_DB_CHANGES.sql` / `prisma migrate deploy`).
2. Deactivate each original, activate its `fleetsync_cC_*` copy — or import these over the originals.
3. Verify runs: Today_pdr, Reminders_pdr, Aggressive_mode, Confirm, Daily_Digest.

## New: notification tick scheduler (M15+ event engine)

`fleetsync_cC_notification_tick.ROlwDmAQxaUr2DxW.json` — **net-new, created inactive** in n8n (id `ROlwDmAQxaUr2DxW`). Not a copy of a published workflow; it drives the new CarCare event-engine dispatcher.

- **Schedule:** hourly (`0 * * * *`, Europe/Bratislava) → **HTTP GET** `https://www.pictusweb.sk/api/cron/notifications/tick` with header `Authorization: Bearer {{ $env.PICTUSWEB_CRON_TOKEN }}` (same env var the other crons use; maps to the app's `CRON_TOKEN`). Idempotent two-pass plan + dispatch; retries 3×.
- **Do NOT activate** until pictusweb **with the CarCare build** is deployed to that host and `CRON_TOKEN` is set there — the endpoint doesn't exist on the currently deployed version. Activating sooner just 404s.
- Dual-run plan: keep the legacy `fleetsync_cC_*` reminder workflows running; once the tick is live and reconciled, retire the legacy ones.

Source snapshot: 2026-11-07 via the n8n REST API.
