# Billbolt UI/UX Analysis Framework & Audit Protocol

> **Purpose for AI Agents:** This guide defines the deterministic UI/UX analysis heuristics, language rules, and component auditing protocol for the Billbolt application. Any AI agent tasked with auditing, reviewing, designing, or refactoring Billbolt interfaces must strictly evaluate the target interface against the criteria in this document.

---

## 1. Core North Star & Philosophy

> **The 2-Second Non-Tech Merchant Rule:**  
> *"If a 50-year-old market trader or first-time merchant using a smartphone cannot understand a screen, button, or label in 2 seconds without prior instruction or technical experience, the design has failed."*

Billbolt is **not an enterprise analytics tool**; it is an effortless daily operational partner for small business owners. The UI must feel completely intuitive, approachable, and impossible to misinterpret.

---

## 2. The 7 Heuristic Pillars for Agent Analysis

When auditing any component, view, or modal, evaluate it across these 7 pillars:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      THE 7 BILLBOLT UX PILLARS                         │
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

---

### Pillar 1: Plain Human Language (No Jargon)
Every label must speak the merchant’s language, never the engineer’s or accountant’s.

| ❌ Prohibited / Jargon Pattern | Why It Fails | ✅ Required Merchant Language |
| :--- | :--- | :--- |
| `"Business Health Index"` | Abstract business-school metric. | `"Daily Business Health"` |
| `"85/100 • Good Momentum"` | Feels like an exam grade. | `"Looking Good"` or `"Great Shape"` |
| `"Local storage"` / `"Offline records"` | Technical database concepts. | `"Saved on this device"` |
| `"Sync"` / `"Cloud Sync"` | Abstract cloud syncing concept. | `"Back Up Now"` / `"Saved to cloud"` |
| `"Bills Issued"` | Formal accounting phrase. | `"Receipts Today"` |
| `"Margin %"` | Merchants rarely track cost ratios on mobile. | Drop from compact cards; focus on units sold & revenue. |
| `"Volume & revenue"` | Corporate finance speak. | `"Sales and units"` |
| `"+ Product"` | Developer shorthand. | `"Add New Item"` |
| `"Sales & Bills"` (Tab Name) | Dual-domain confusion; combines an action with accounting paperwork. | `"Sales"` |
| `"Receipt Records"` | Overly formal administrative archive tone. | `"Sales History"` |
| `"Issue your first bill"` | Accountant bookkeeping jargon. | `"Log your first sale"` |
| `"Load More (Showing 15 of 42)"` | Exposes programmer array length indices. | `"Show more sales"` |
| `"Receipt #"` | `#` hashtag symbol adds visual noise. | `"Receipt number"` |

---

### Pillar 2: Information Density & Screen Role Clarity
- **Rule of 3–4**: Never put more than 3 to 4 metrics on a single mobile glance card.
- **No Russian Doll Nesting**: Do not place a boxed card inside another card inside a container (`cards inside cards`). Use subtle dividers or whitespace for separation.
- **Metric Relevance**: Do not mix unrelated domains. (e.g., Stock count does not belong inside a Revenue card—stock has its own dedicated alert banner).
- **Operations vs. Analytics Separation**: Operational screens (such as **Sales** or **Inventory**) must never be clogged with ~500px of scrolling charts, trend graphs, or demographic progress bars. Those belong strictly on the dedicated **Reports** screen. An operational screen exists for two instant tasks: (1) trigger the operation, (2) look up records.

---

### Pillar 3: Single Focal Anchor & Screen Rhythm
- **The One-Hero Rule**: Every screen must have **exactly one primary hero CTA** in solid brand blue (`bg-bolt-blue`).
- **No Color Competition**: Secondary action buttons or companion chips must **never** borrow the hero button's saturated color. They must use neutral card surfaces (`bg-bolt-card border border-bolt-border`).
- **Scan Affordance**: Never display an icon-only square button next to a primary button without an explicit label. A QR icon alone is ambiguous; label it `"Scan"`.
- **The 3-Step Screen Rhythm (Context First, Action Second, Ledger Third)**:
  Both the Dashboard and operational screens must preserve the exact same cognitive reading sequence:
  1. **Context First**: High-level daily pulse (`TodayRevenueCard` with signature 4px brand gradient band)
  2. **Action Second**: Primary operational triggers (`SaleActionRow`: Record a Sale + Scan)
  3. **Ledger Third**: The records / transactions (Recent Sales on Dashboard; full searchable Sales History on Sales tab)
  *Never invert this order by placing action buttons above the daily summary on one screen and below on another.*

---

### Pillar 4: Navigation Discipline (No Bottom Tab Duplication)
Billbolt has a permanent 4-tab bottom bar:
1. 🏠 **Dashboard** (`index`)
2. 🧾 **Sales** (`ReceiptScreen`)
3. 📦 **Inventory** (`InventoryScreen`)
4. 📊 **Reports** (`ReportScreen`)

- **Prohibition**: Never place quick chips on the dashboard whose sole purpose is navigating to one of these 3 screens. It clutters the screen with 100% duplicate links.
- **Action Area Rule**: The dashboard `ActionButtons` area is strictly reserved for **operations that actually *do work***:
  - Selling: **Record a Sale**, **Scan Item**
  - Stock Operations: **Add New Item**, **Restock Items**

---

### Pillar 5: Semantic Color Integrity
Colors in commerce carry universal subconscious meanings:
- **Brand Blue (`#2563EB` / `Colors.primary`)**: The primary interactive action color for the brand. All modal submit buttons (`Save Product`, `Record Sale`, `Confirm Restock`) must use brand blue.
- **Emerald / Green (`Colors.success`)**: Strictly reserved for **money earned**, revenue, positive cash flow, and healthy stock states.
  - *Anti-pattern*: Never use green for restocking spend. Restocking is a business expense (`Total Restock Spend: ₦X`); styling it green contradicts retail financial semantics.
- **Amber / Yellow (`Colors.warning`)**: Reserved for operational attention (items needing reorder, offline mode).
- **Red / Coral (`Colors.danger`)**: Reserved for out-of-stock items or fatal errors.

---

### Pillar 6: Affordances & Tactile Physics
- **List Item Tappability**: If tapping a table row or receipt opens a detail modal, it must visually communicate that affordance via a subtle right chevron (`ArrowRight01Icon`, muted opacity).
- **Touch Target Minimum**: All mobile interactive buttons must be at least **44×44px** (or `py-3` with generous horizontal span).
- **Physical Feedback**: Every pressable element must incorporate haptic feedback (`Haptics.impactAsync` or `Haptics.selectionAsync`) and an immediate active state (`activeOpacity={0.75}` or `active:scale-[0.98]`).

---

### Pillar 7: Typographic Polish & Cleanliness
- **No Emojis as UI Icons**: Never use floating emojis (`✓`, `👍`, `⚠️`, `🚀`) in cards or status badges. Use crisp vector SVG icons (`@hugeicons/react-native`) or clean typography.
- **No Hashtag Rankings**: Avoid `#1`, `#2`, `#3`. The `#` symbol creates visual noise. Use clean numbers (`1`, `2`, `3`) or ordinals (`1st`, `2nd`).
- **Grammatical Pluralization**: Never output lazy programmer strings like `3 item(s)`. Dynamically format: `count === 1 ? "1 item" : `${count} items``.
- **Title Case Badges**: Avoid aggressive ALL-CAPS badges (`CASH`, `TRANSFER`). Use clean Title Case (`Cash`, `Transfer`).

---

## 3. Step-by-Step Agent Audit Protocol

When an agent is asked to audit or review any Billbolt screen or component, it must execute the following 5-step checklist:

### Step 1: Scan for Jargon & Abstractions
- Read every visible label, subtitle, placeholder, and toast message.
- Flag any technical words (`sync`, `local storage`, `records`, `index`, `volume`).
- Replace with direct physical-world equivalents.

### Step 2: Count Data Points per Card
- Count the discrete metrics on each card.
- If a card has > 4 data points, distill it:
  - Which metric drives immediate daily action? Keep it.
  - Which metric is secondary or speculative? Remove or relocate to a detail screen.

### Step 3: Check for Color Competition & Duplicate Nav
- Identify the primary CTA. Does any neighboring chip or badge steal its hue?
- Look at the bottom navigation bar. Does any button on the screen simply replicate a bottom tab? If so, eliminate it or replace it with an operational modal trigger.

### Step 4: Verify Touch Affordance & Grammar
- Are all actionable rows equipped with chevron indicators?
- Are payment method tags and badges formatted in Title Case?
- Are counts grammatically pluralized without `(s)`?

### Step 5: Verify Accessibility & Feedback
- Does every `TouchableOpacity` / `Pressable` have `accessibilityRole="button"` and a meaningful `accessibilityLabel`?
- Is haptic feedback triggered on press?

---

## 4. Case Studies & Reference Transformations

### Case Study 1: The Home Dashboard Transformation

| Component | Before (Failed UX) | After (Compliant UX) | Pillar Applied |
| :--- | :--- | :--- | :--- |
| **Header Badge** | `FREE` (felt limiting/cheap) | `STARTER PLAN` (professional) | Pillar 1 |
| **Sync Banner** | *"Offline Mode • Sales saved to local storage"* | *"Working offline • Sales are safely saved on this device"* | Pillar 1 |
| **Revenue Card** | Crammed `Low Stock` + `Bills Issued` + floating `+12%` | `Receipts Today` + `This Month` + `+12% vs yesterday` | Pillar 1 & 2 |
| **Scan Button** | Lone QR icon (unlabeled, ambiguous) | Companion button with icon + `"Scan"` label | Pillar 3 & 6 |
| **Action Chips** | 4 identical white chips duplicating bottom tabs (`Receipts`, `Reports`, `Stock`) | 2 wide operational buttons: `Add New Item` & `Restock Items` | Pillar 3 & 4 |
| **Health Card** | `Business Health Index: 85/100 • Good Momentum` with emojis | `Daily Business Health: Looking Good` with clean typography | Pillar 1, 5, 7 |
| **Recent Sales Row** | `1 item(s)`, `CASH` badge, no chevron | `1 item`, `Cash` badge, right chevron affordance | Pillar 6 & 7 |
| **Top Performers** | 7 metrics (margin %, category, `#1`, nested box) | 4 metrics (rank `1`, status, units sold, revenue) | Pillar 2 & 7 |
| **Restock Modal** | Mint-green button for an inventory expense | Unified brand blue matching all other modals | Pillar 5 |

### Case Study 2: The Sales Screen Transformation

| Component | Before (Failed UX) | After (Compliant UX) | Pillar Applied |
| :--- | :--- | :--- | :--- |
| **Tab Bar Name** | `"Sales & Bills"` (dual-domain confusion) | `"Sales"` (plain, direct merchant language) | Pillar 1 |
| **Screen Architecture** | 500px of scrolling analytics (2x2 grid, 7-day line chart, progress bars) | Clean operational ledger (Today card ➔ Action Row ➔ Sales History) | Pillar 2 |
| **Today Summary** | Ad-hoc mint-icon box with small text (divergent styling) | Unified `TodayRevenueCard` (signature 4px gradient band, hero amount, sub-stats) | Pillar 2 & 3 |
| **Selling CTA Row** | Hardcoded split button with `BarCodeIcon` (different from dashboard) | Unified `SaleActionRow` (`Record a Sale` + `Scan`, identical geometry & haptics) | Pillar 3 & 6 |
| **Screen Reading Flow** | Buttons above summary (inconsistent with dashboard) | Context First (Revenue) ➔ Action Second (Sell/Scan) ➔ Ledger Third (List) | Pillar 3 |
| **Section Title** | `"Receipt Records"` / `"{n} total receipts issued"` | `"Sales History"` / `"{n} sales recorded"` | Pillar 1 & 7 |
| **Search Input** | `"Search customer, receipt # or item..."` (used `#`) | `"Search by customer, receipt number or date..."` | Pillar 7 |
| **Payment Badges** | `CASH`, `TRANSFER`, `CARD` (ALL-CAPS) | `Cash`, `Transfer`, `Card` (Title Case) | Pillar 7 |
| **Pagination CTA** | `"Load More (Showing 15 of 42)"` (exposed array indices) | `"Show more sales"` (action-oriented merchant language) | Pillar 1 & 6 |
| **Empty State** | `"Tap 'Record a Sale' to issue your first bill."` | `"Tap 'Record a Sale' to log your first sale."` | Pillar 1 |

### Case Study 3: The Inventory Screen Transformation

| Component | Before (Failed UX) | After (Compliant UX) | Pillar Applied |
| :--- | :--- | :--- | :--- |
| **Screen Title** | `"Inventory & Stock"` (redundant title) | `"Inventory"` (clean, single mental model) | Pillar 1 |
| **Subtitle** | `"Track catalog, restocks & low-stock alerts"` | `"Your products, stock levels, and reorder alerts"` | Pillar 1 |
| **Add Button** | `"Add Product"` with `#FFFFFF` hex | `"Add New Product"` with `Colors.card` token | Pillar 1 & 5 |
| **Product Cards** | 135px tall card with nested 4-col box & margin % | **Compact 2-line row (~64px)**: Name, Category, Stock Level, Price, Restock | Pillar 2 & 3 |
| **Card Calculations** | Inline `unitProfit` and `margin %` formulas in `.map()` | Cleaned up; catalog focuses on rapid stock lookup and restock | Architecture |
| **Status Cards** | Used raw Tailwind colors (`bg-red-100 border-red-500`) | Standardized on design tokens (`bg-bolt-danger-bg`) | Token Hygiene |
| **Search Input** | 38px height with 12px `text-xs` and 16px icon | 48px (`h-12`) height with 14px `text-sm`, 18px icon | Pillar 6 |
| **Search Clear Button** | 14px icon with no touch hit area | 32×32px touch target with accessibility label | Pillar 6 |
| **Count Indicator** | `"Showing {n} of {n} products"` (programmer pagination) | `"{n} items"` (merchant-friendly) | Pillar 1 |
| **Load More** | `"Load More Products ({n} of {n})"` | `"Show more items"` | Pillar 1 & 6 |
| **Empty State** | `'Tap "+ Add Product" above to add new inventory...'` | `'Tap "Add New Product" above to add new inventory...'` | Pillar 1 |

### Case Study 4: The Reports Screen Transformation (Merchant-First Paradigm)

| Component | Before (Failed UX) | After (Compliant UX) | Pillar Applied |
| :--- | :--- | :--- | :--- |
| **Top Card (Context)** | Missing gradient band; generic white box buried under tabs | **Signature 4px Brand Gradient Take-Home Profit Card** | Pillar 3 & 4 |
| **Timeframe Selector** | `"This Cycle (14-13)"` (developer billing cycle dates) | **Merchant Rhythm**: `This Month`, `Last Month`, `All Time` | Pillar 1 |
| **Hero Metric** | `"CURRENT PERIOD REVENUE"` (all-caps spreadsheet revenue) | **`Your Take-Home Profit`** (`+₦...`) with plain English translation | Pillar 1 |
| **Plain English Margin** | Abstract `"24% margin"` with raw inline hex | *"For every ₦1,000 sold, you pocketed ₦240 as pure profit."* | Pillar 1 |
| **Cash Flow Health** | Hidden or uncoordinated across tabs | **Cash Flow Reality Check**: Money In vs Restock Spent vs Cash Left Over | Pillar 1 & 3 |
| **Top Products** | Wall of 29 cards with nested inner boxes | **Top Money Makers**: Top 5 products ranked by real profit brought in | Pillar 1 & 2 |
| **Screen Title** | `"Financial & Sales Reports"` (3-word title) | `"Reports"` (single-word parity with all screens) | Pillar 1 |
| **Subtitle** | `"Profit margins, cost breakdown & top products"` | `"Your earnings, spending, and best-selling products"` | Pillar 1 |
| **Product List** | Isolated floating cards with inner nested `bg-bolt-surface` box | **Single Unified Grouped Card** (`overflow-hidden border-b`) | Pillar 2 & 3 |
| **Search Input** | 38px height with 12px `text-xs` and 15px icon | 48px (`h-12`) height with 14px `text-sm`, 18px icon | Pillar 6 |
| **Pagination** | `"Load More Products ({n} of {n})"` | `"Show more products"` | Pillar 1 & 6 |

### Case Study 5: The Full-Screen POS Architecture (Eliminating Modal Inception)

| Component | Before (Failed UX & Architecture) | After (Compliant Full-Screen POS) | Pillar Applied |
| :--- | :--- | :--- | :--- |
| **Architecture** | 3 nested `<Modal>` trees mounted twice in memory | **Dedicated Full-Screen Route** (`RecordSaleScreen.tsx`) via `router.push` | Pillar 2 & 4 |
| **Screen Real Estate** | Capped at 94% bottom-sheet with dark backdrop | **100% Full Display**: 8–10 products visible at once | Pillar 2 & 6 |
| **Step 1: Search & Scan** | Cramped `py-2.5` (~40px) with 12px text & misaligned icon | **Unified 48px (`h-12`)** search bar + `h-12` companion Scan button | Pillar 3 & 6 |
| **Step 1: Catalog List** | Every item isolated in a separate floating card (3 visible per screen) | **Single Unified Grouped Card** with hairline dividers (8-10 visible) | Pillar 2 & 3 |
| **Step 1: Stepper Affordance** | Silent removal when decrementing `1` to `0` | Shows red **Trash/Delete icon** at quantity `1` before removal | Pillar 6 |
| **Step 1: Row Tappability** | Small 40px "Add" button only | **Entire row is tappable** to add +1 to cart | Pillar 6 |
| **Step 2: Brand Identity** | Plain card with no brand gradient | **Signature 4px Brand Gradient Band** atop Summary Card | Pillar 3 & 7 |
| **Step 2: Sticky Checkout** | Confirm button buried at bottom of ScrollView (pushed offscreen) | **Permanent Sticky Bottom Checkout Bar** (`Total Due` + `Confirm Sale`) | Pillar 3 & 6 |
| **Step 2: Order Ledger** | Bulky nested steppers and trash icons in summary card | **Clean, Compact Scannable Ledger Rows** (`Name • ₦Price` ➔ `₦Total × Qty`) | Pillar 2 |
| **Step 2: Payment Selector** | Buried below customer inputs near bottom of screen | **Promoted directly under Order Ledger** as the #1 active checkout decision | Pillar 2 & 3 |
| **Step 2: Cognitive Load** | 160px permanent discount block with 2 tabs, input, 4 buttons | **Collapsible `+ Add Discount (Optional)`** chip (zero clutter when unused) | Pillar 2 |
| **Step 2: Color War** | 5 competing solid blue blocks fighting the submit button | Selection chips use soft active tints; **Only the submit CTA is solid blue** | Pillar 3 & 5 |
| **Step 2: Safe Navigation** | Tapping `X` permanently destroyed the entire cart | Non-destructive `‹ Edit Items` safely returns to catalog | Pillar 6 |
| **Step 3: Jargon** | `"Sale logged & inventory updated!"` (database speak) | `"Sale recorded successfully!"` (human merchant celebration) | Pillar 1 |
| **Step 3: Double Hash** | `"Receipt #: #849201"` (double hashtag noise) | `"Receipt Number"` \| `#849201` | Pillar 1 & 7 |
| **Step 3: Pluralization** | `"3 product(s)"` (lazy developer string) | `"3 products"` / `"1 product"` (grammatical formatting) | Pillar 7 |

---

## 5. Architectural Foundation: Logic Separation & DRY Components

To prevent UI and visual regression over time, agents must enforce two engineering laws:

1. **Strict Logic-to-Hook Isolation**:
   - Every complex screen must have a dedicated hook (e.g., `useReceiptScreen.ts`).
   - The hook is solely responsible for data fetching, filtering, calculating totals, and formatting currency/dates.
   - The screen component (e.g., `ReceiptScreen.tsx`) must contain **zero calculations or string formatting**—it simply receives ready-to-render variables from the hook.

2. **The DRY Component Rule (Shared DNA)**:
   - When an interactive pattern or card appears on multiple screens (e.g., selling buttons or daily revenue cards), **never duplicate the markup or styling**.
   - Extract a reusable component:
      - `SaleActionRow.tsx`: Single source of truth for the Record a Sale + Scan CTA.
      - `TodayRevenueCard.tsx`: Single source of truth for the daily revenue glance card with brand gradient band.
      - `BackButton.tsx`: Single source of truth for all secondary screen back navigation with tactile haptics.
      - `ConfirmDialog.tsx`: Single source of truth for branded, accessible confirmation dialogs (eliminating raw `Alert.alert`).
      - `QuantityPickerModal.tsx`: Single source of truth for bulk quantity input and presets across POS.
     - This ensures muscle memory and visual styling never drift when a developer edits one screen.

3. **The Zero Default Tailwind Colors Rule (Design System Fidelity)**:
   - **Never use uncurated default Tailwind colors** (e.g., `bg-blue-50`, `active:bg-blue-700`, `bg-blue-100`, `text-white`, `border-blue-200`).
   - Strictly consume branded tokens from `tailwind.config.js` (e.g., `bg-bolt-blue`, `bg-bolt-light`, `active:bg-bolt-primary-dark`, `text-bolt-card`, `border-bolt-border`, `bg-bolt-divider`) or the `Colors` object in `apps/mobile/lib/colors.ts`.
   - Any raw hex code or default Tailwind color is considered an immediate design system violation.

---

## 6. Agent Output Format Requirement

When delivering a UX audit to a user or developer, the agent must present findings in this structured format:

1. **Quick Diagnosis**: One paragraph stating the emotional and cognitive impression.
2. **Table of Violations**: Component | Current Copy / Pattern | Pillar Violated | Suggested Replacement.
3. **Information Architecture Check**: Identify redundant navigation vs. real actions.
4. **Concrete Action Plan**: File-by-file refactor list adhering to the 7 pillars.
