# 🚀 BillBolt Migration & Feature Roadmap

This document outlines the migration features and offline capabilities for **Version 1.0 (Baseline)** and planned features for **Version 2.0+** to assist businesses transitioning from legacy paper ledgers or third-party systems to BillBolt.

---

## 📌 Version 1.0 (Current Baseline)
* [x] **Offline-First Architecture & Outbox Queue**:
  * Persistent local storage caching via `AsyncStorage` for all products, sales, receipts, and metrics.
  * Instant offline receipt & sale creation with local inventory deduction and temporary ID assignment.
  * Real-time offline metrics recalculation so the dashboard remains active without connectivity.
  * Automatic background synchronization via NetInfo listener whenever internet connection is restored.
  * Status indicator pill in Header: `Offline (X unsynced)`, `Syncing...`, and `Synced`.
* [x] **Backdated / Custom Date Sales Entry**:
  * Ability to record receipts and sales with past dates.
  * Correct cycle and analytics attribution for historical entries.
  * "Historical Record" option to enter paper sales without strict live inventory locks.

---

## 🔮 Version 2.0 Upgrades

### 1. 📊 Bulk CSV / Excel Upload (`/api/import/sales`)
* **Objective:** Enable businesses with existing spreadsheets or digitized paper books to import hundreds of past transactions in seconds.
* **Key Components:**
  * **Downloadable Template:** Standard `.csv` and `.xlsx` template with columns: `Date (YYYY-MM-DD)`, `Customer Name`, `Customer Phone`, `Product Name`, `Quantity`, `Unit Price`, `Payment Method`, `Sold By`, `Notes`.
  * **Smart Column Mapping & Auto-Match:** Automatically match product names in the CSV with existing inventory products (or auto-create missing products).
  * **Batch Validation Engine:** Preview rows with syntax/validation check before committing to the database.
  * **Rollback & Error Logs:** Downloadable error log for any skipped or malformed rows.

---

### 2. 📸 AI Paper Ledger & Receipt Scanner (OCR & Vision AI)
* **Objective:** Allow business owners to snap photos of their handwritten paper receipt books, invoices, or logbook pages.
* **Key Components:**
  * **Camera Capture UI:** High-resolution document capture with automatic edge detection and perspective correction.
  * **Multimodal AI / OCR Pipeline:** Powered by Gemini AI Vision / Firebase AI Logic to extract:
    * Transaction date & time
    * Customer details
    * Line items, quantities, and prices
    * Payment method
  * **Draft Review Screen:** Display parsed items alongside the photo preview for quick user confirmation and 1-tap save.

---

### 3. ⚖️ Opening Balance & Historical Revenue Calibration
* **Objective:** Zero-friction setup for businesses with years of paper records who don't want to re-type every individual sale.
* **Key Components:**
  * **Period Summary Entry:** Input lump-sum monthly or annual totals (e.g. *January 2025: ₦1,250,000 Revenue, ₦900,000 Cost*).
  * **Analytics Calibration:** Integrate opening revenue into long-term growth and year-over-year performance charts without inflating product-level unit sales.

---

## 🛠️ Implementation Priority Matrix

| Feature | Complexity | Speed to Value | Target Release |
| :--- | :--- | :--- | :--- |
| **Offline-First Sync Engine** | High | Immediate | **v1.0 (Live)** |
| **Backdated Sales Entry** | Low | Immediate | **v1.0 (Live)** |
| **Bulk CSV/Excel Upload** | Medium | High | **v2.0 - Phase 1** |
| **Opening Balance Summary** | Low-Med | High | **v2.0 - Phase 1** |
| **AI Camera Ledger Scanner**| Med-High | Very High | **v2.0 - Phase 2** |
