# Eimaan Maison — Mobile Tracker

A small Expo app for logging sales, restocks, and new products on the go.
It talks to the `eimaan-backend` NestJS API (Postgres-backed), which is
the system of record — safe for multiple people logging at the same time.

## How it fits together

```
[Expo app] --fetch(JSON, x-api-key)--> [NestJS API on Railway] --> [Postgres]
```

## Setup

1. Deploy `eimaan-backend` first (separate zip / folder — see its README).
   You'll end up with a URL like `https://eimaan-api.up.railway.app` and
   an `API_KEY` value you chose.
2. Open `src/api.ts` here and fill in:
   ```ts
   export const API_BASE_URL = 'https://eimaan-api.up.railway.app';
   export const API_KEY = 'the-same-key-you-set-on-railway';
   ```
3. Install and run:
   ```
   npx create-expo-app eimaan-maison-app
   # copy App.tsx, app.json, and src/ into that folder, overwriting the defaults
   cd eimaan-maison-app
   npm install
   npx expo start
   ```
   Scan the QR code with the **Expo Go** app on your phone to test
   immediately — no build required.

## Offline support

`src/offlineQueue.ts` already handles it: if a submission fails (no
signal), it's saved on the phone and retried automatically, with a manual
"pull to sync" on the Home screen in the meantime.

## Legacy fallback

The `backend/` folder (Apps Script + Google Sheets) from the earlier
version is kept here in case you ever want to fall back to a
zero-hosting-cost setup for a single user — but it's not used by this
version of the app, and has the concurrent-write limitation discussed
earlier. The NestJS API is the recommended path going forward.

## Going further

- **Publishing to the Play Store / App Store**: `eas build` packages this
  into a real installable app once you're happy with it in Expo Go.
- **Migrating your existing spreadsheet data**: say the word and I'll
  write a one-off script that reads your xlsx and POSTs everything into
  the new API, so you're not re-typing history.
