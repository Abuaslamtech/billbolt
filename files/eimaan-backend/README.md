# Eimaan Maison API

NestJS + Postgres backend replacing the Google Sheets/Apps Script version.
Concurrent writes from multiple staff are now handled safely by the
database itself — no more "find the next empty row" race condition.

## Endpoints

All endpoints (except none — everything requires auth) need header
`x-api-key: <your API_KEY>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/products` | Add a product |
| GET | `/products` | Full list with computed stock + status |
| GET | `/products?namesOnly=1` | Just names, for dropdowns |
| POST | `/sales` | Log a sale (`{ date, product, qty, soldBy? }`) |
| POST | `/restocks` | Log a restock (`{ date, product, qty, costPerUnit }`) |
| GET | `/analytics/dashboard` | This cycle / quarter / half-year / year snapshot + stock alerts |
| GET | `/analytics/monthly` | Every 14th–13th cycle, revenue/cost/profit/units/restock spend |
| GET | `/analytics/quarterly` | Same, grouped in 3s |
| GET | `/analytics/half-yearly` | Same, grouped in 6s |
| GET | `/analytics/annual` | Same, grouped in 12s |
| GET | `/analytics/product-performance` | Per-product totals + per-cycle breakdown |

## Deploy to Railway (or Render / Fly — same idea)

1. Push this folder to a GitHub repo.
2. In Railway: **New Project → Deploy from GitHub repo**, pick it.
3. **Add a Postgres database** (Railway → New → Database → PostgreSQL).
   Railway automatically injects `DATABASE_URL` into your service — you
   don't need to set it by hand.
4. Add one environment variable yourself: `API_KEY` — any long random
   string (e.g. generate one with `openssl rand -hex 32`).
5. Railway detects the `Dockerfile` and builds/deploys automatically.
   On first boot, `prisma migrate deploy` runs and creates the tables.
6. Once it's live, copy the public URL Railway gives you
   (e.g. `https://eimaan-api.up.railway.app`).

## Local development

```
cp .env.example .env      # fill in a local DATABASE_URL and API_KEY
npm install
npx prisma migrate deploy
npm run start:dev
```

## Migrating your existing data from the spreadsheet

Once this is live, your Products/Sales/Restocks Google Sheet data can be
re-entered here (or I can write a one-off import script that reads the
xlsx and POSTs everything in) — say the word if you want that done rather
than manually.
