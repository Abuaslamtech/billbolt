# ⚡ Billbolt — Smart Business Made Simple

<p align="center">
  <strong>An offline-first, high-speed Point of Sale (POS), inventory management, and digital receipt platform tailored for retail merchants and emerging markets.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0_Stable-0052CC.svg" alt="Version" />
  <img src="https://img.shields.io/badge/Expo-SDK_57-000000.svg" alt="Expo SDK 57" />
  <img src="https://img.shields.io/badge/React_Native-0.76+-61DAFB.svg" alt="React Native" />
  <img src="https://img.shields.io/badge/Backend-NestJS_10-E0234E.svg" alt="NestJS" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL_%2B_Prisma-2D3748.svg" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Architecture-Offline--First-15803D.svg" alt="Offline First" />
  <img src="https://img.shields.io/badge/Organization-AtlabX_Technologies-0F2A63.svg" alt="AtlabX Technologies" />
</p>

---

## 📖 Overview

**Billbolt** transforms messy paper logbooks, unrecorded stock leakages, and complex enterprise POS software into an effortless, ultra-fast operational tool for daily retail commerce.

Designed specifically for small business owners, boutiques, kiosks, pharmacies, and supermarkets across emerging markets (Nigeria and Africa), Billbolt turns any standard smartphone into a fully functioning commercial barcode scanner, digital receipt generator, and financial reality checker.

### 🌟 Core Philosophy: *The 2-Second Non-Tech Merchant Rule*
> *"If a 50-year-old market trader or first-time merchant using a smartphone cannot understand a screen, button, or label in 2 seconds without prior instruction or technical experience, the design has failed."*

---

## 🚀 Key Features

### 🛒 1. High-Speed Point of Sale (POS) & Checkout
- **Unified Full-Screen POS:** Fast catalog navigation with immediate search and integrated barcode scanner trigger.
- **Dynamic Quantity Picker:** Inline steppers + `QuantityPickerModal` with rapid bulk presets (`+5`, `+10`, `+25`, `+50`, `+100`) and numeric keypad.
- **Multi-Payment Support:** `Cash`, `Transfer` (bank transfer), `Card`, and `Other/POS`.
- **Collapsible Discount Drawer:** Add fixed amount or percentage discounts without cluttering the checkout screen.
- **Customer CRM:** Log customer names and phone numbers for repeat purchase tracking.
- **Backdated Sales Entry:** Record past paper sales to specific calendar dates to backfill ledgers without breaking live stock locks.

### 📦 2. Smart Inventory & Stock Control
- **Atomic Stock Deductions:** Real-time stock decrementing on checkout with offline synchronization locks.
- **Low-Stock & Reorder Alerts:** Visual badges and notifications triggered when items reach their custom reorder thresholds (`reorderLevel`).
- **Batch Restocking Workflow:** Log supplier restocks with unit cost recording, total expense calculations, and vendor notes.
- **QR Code & Barcode Label Generator:** Generate and print scannable QR and barcode labels to stick directly onto shop shelves or item packaging.
- **Camera Barcode & QR Scanner:** Real-time camera viewfinder for rapid instant-add checkout.

### 🧾 3. Digital Receipts & Instant Trust
- **Branded Digital Receipts:** Auto-generates unique receipt numbers (e.g., `#REC-849201`).
- **Instant WhatsApp & SMS Sharing:** 1-tap sharing directly to customer phones via WhatsApp or system share.
- **Thermal Printer & PDF Ready:** Formatted for 58mm/80mm Bluetooth thermal POS printers and PDF document generation.
- **Sales History & Safe Refunds:** Instant search across historical receipts with clear detail inspection and refund tracking.

### 📶 4. 100% Offline-First Architecture & Outbox Queue
- **Zero-Latency Offline POS:** Full local caching via `AsyncStorage` + reactive `Zustand` stores (`saleStore`, `AppDataStore`, `syncStore`).
- **Automatic Background Sync:** NetInfo listener monitors network changes and triggers automatic bidirectional synchronization when connectivity is restored.
- **Human Sync Status Indicators:**
  - 🟡 `Working offline • Sales are safely saved on this device`
  - 🔵 `Backing up to cloud...`
  - 🟢 `All records backed up`

### 📊 5. Merchant-First Analytics ("The Reality Check")
- **Take-Home Profit Readout:** Replaces confusing accounting terms with direct net profit (`Your Take-Home Profit: +₦...`).
- **Plain-Language Margin Translation:** Contextual profit explanations (e.g., *"For every ₦1,000 sold, you pocketed ₦240 as pure profit"*).
- **Cash Flow Reality Check:** Visual comparison between **Money In** (Sales Revenue), **Restock Spent** (Inventory Expense), and **Cash Left Over**.
- **Top Money Makers:** Ranks bestsellers by actual net profit generated rather than misleading raw unit volume.

### 🔐 6. Security, Biometrics & Regional Localization
- **AppLock Biometrics:** Protect daily sales and financial reports with Face ID, Fingerprint, or PIN (`expo-local-authentication`).
- **FCM Push Notifications:** Real-time notifications for low-stock warnings and sync updates.
- **Auto Currency & Timezone Detection:** Automatically detects local currency (₦ NGN, $, €, SAR, etc.) with manual configuration override.

---

## 🎨 Design System & UI/UX Standards

Billbolt strictly adheres to the **7 UX Pillars** established in [`UI_UX_ANALYSIS_GUIDE.md`](file:///home/abuaslam/Billbolt%20App/UI_UX_ANALYSIS_GUIDE.md):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE 7 BILLBOLT UX PILLARS                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Plain Human Language        (Zero developer or financial jargon)     │
│ 2. Information Density          (Max 3–4 metrics; one card, one insight)│
│ 3. Single Focal Anchor          (One primary hero CTA; no color wars)  │
│ 4. Navigation Discipline        (Zero duplication of bottom tab bar)   │
│ 5. Semantic Color Integrity     (Green = profit, Blue = action)         │
│ 6. Affordance & Tactility       (Every tappable item looks tappable)   │
│ 7. Typographic Polish           (No emojis, no '#', Title Case badges) │
└────────────────────────────────────────────────────────────────────────┘
```

### Color Tokens (`lib/colors.ts`)

| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `bolt-blue` | `#0052CC` | Primary brand authority blue & hero interactive CTA anchor |
| `bolt-primary-dark` | `#003A99` | Pressed / Active state for primary buttons |
| `bolt-light` | `#E8F0FE` | Soft blue surface for active badges and chips |
| `bolt-surface` | `#F9FAFB` | Clean screen canvas background |
| `bolt-card` | `#FFFFFF` | Elevated card surface with `#E5E7EB` borders |
| `bolt-success` | `#15803D` (`#F0FDF4`) | **Money In & Profit only** (Never used for expenses) |
| `bolt-danger` | `#DC2626` (`#FEF2F2`) | Out-of-stock items, destructive deletes, system alerts |
| `bolt-warning` | `#D97706` (`#FFFBEB`) | Reorder thresholds, offline warning notices |
| `bolt-graphite` | `#1A1A1A` | High-contrast primary typography |
| `bolt-slate` | `#6B7280` | Muted secondary descriptors and labels |

---

## 🏗️ Monorepo Structure

```
billbolt-monorepo/
├── apps/
│   ├── mobile/             # React Native / Expo SDK 57 mobile application
│   │   ├── app/            # Expo Router file-based navigation
│   │   │   ├── (auth)/     # Login, Signup, SetupShopWizard, ShopReady
│   │   │   ├── (main)/     # Dashboard, Sales, Inventory, Reports tabs
│   │   │   ├── (onboarding)/# First-launch feature tour & notification primer
│   │   │   └── (sale)/     # Full-screen POS checkout & success flow
│   │   ├── components/     # Reusable UI components & modals
│   │   ├── hooks/          # Dedicated data & logic isolation hooks
│   │   ├── lib/            # Design tokens, colors, formatters, localization
│   │   ├── services/       # Offline storage, sync engine, auth services
│   │   └── store/          # Zustand global stores (AppData, Sale, Sync)
│   │
│   ├── api/                # NestJS backend REST API
│   │   ├── prisma/         # Prisma schema & database migrations (PostgreSQL)
│   │   └── src/            # Auth, Business, Inventory, Receipts, Analytics modules
│   │
│   ├── admin/              # Web administration portal
│   └── landing/            # Public marketing landing page
│
├── packages/
│   ├── tsconfig/           # Shared TypeScript configs
│   └── types/              # Shared data contracts & type definitions
│
├── FUTURE_ROADMAP.md       # Migration roadmap & AI Vision upgrades
├── UI_UX_ANALYSIS_GUIDE.md # 7-Pillar design and audit heuristic framework
├── package.json            # Root workspace configuration (Turborepo + pnpm)
└── turbo.json              # Turborepo task pipeline
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile App** | React Native, Expo SDK 57, Expo Router, NativeWind (Tailwind CSS), Reanimated 3, Hugeicons |
| **State & Offline Storage** | Zustand, AsyncStorage, NetInfo, Custom Outbox Queue Sync Engine |
| **Hardware Integrations** | Expo Camera (Scanner), LocalAuthentication (Biometrics), Expo Print, Expo Haptics |
| **Backend API** | NestJS (TypeScript), Prisma ORM, Passport JWT, Firebase Admin, Cloudinary |
| **Database** | PostgreSQL |
| **Monorepo Engine** | Turborepo, pnpm workspaces |

---

## ⚡ Quick Start & Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or `v11.x` (`npm install -g pnpm`)
- **Expo CLI** & **EAS CLI**: (`npm install -g expo-cli eas-cli`)
- **PostgreSQL**: Local or hosted instance (Supabase, Neon, AWS RDS, Docker)

### 2. Installation
Clone the repository and install dependencies across the monorepo:
```bash
git clone https://github.com/Abuaslamtech/billbolt.git
cd "Billbolt App"
pnpm install
```

### 3. Environment Configuration

#### Backend API Setup (`apps/api/.env`):
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/billbolt?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
REFRESH_TOKEN_EXPIRATION="30d"

# Optional Cloudinary & Firebase
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

Initialize database migrations:
```bash
cd apps/api
pnpm prisma db push
# or pnpm prisma migrate dev
```

#### Mobile App Setup (`apps/mobile/.env`):
```env
EXPO_PUBLIC_API_URL="http://YOUR_LOCAL_IP:3000/api"
```

### 4. Running the Development Environment

Run the entire monorepo with Turborepo:
```bash
pnpm dev
```

Or run individual apps:

**Start Mobile App (Expo):**
```bash
cd apps/mobile
pnpm start
# Press 'a' for Android emulator or scan QR code with Expo Go / Dev Build
```

**Start Backend API (NestJS):**
```bash
cd apps/api
pnpm start:dev
```

---

## 🔮 Roadmap & Upcoming Releases

| Milestone | Key Features | Status |
| :--- | :--- | :--- |
| **v1.0 (Live Baseline)** | • Offline-first outbox sync engine<br>• Full-screen POS & Camera Barcode Scanner<br>• WhatsApp & PDF receipts<br>• AppLock biometrics & Take-Home profit analytics | ✅ Complete |
| **v2.0 (Phase 1)** | • **Bulk CSV/Excel Upload** (`/api/import/sales`): Import past product lists and sales history in seconds<br>• **Opening Balance Calibration**: Input lump-sum historical revenue without skewing product stock | ⏳ In Progress |
| **v2.0 (Phase 2)** | • **AI Camera Ledger Scanner**: Snap photos of handwritten paper receipt books to extract line items, prices, and dates via Multimodal Vision AI (Gemini / Firebase AI Logic) | 📋 Planned |

---

## 🏢 About & Attribution

Billbolt is designed, engineered, and maintained by **AtlabX Technologies**.

- **Website:** [https://billbolt.atlabx.com](https://billbolt.atlabx.com)
- **Company:** [https://atlabx.com](https://atlabx.com)
- **Support:** [support@billbolt.atlabx.com](mailto:support@billbolt.atlabx.com)
- **Copyright:** © 2026 Billbolt / AtlabX Technologies. All rights reserved.
