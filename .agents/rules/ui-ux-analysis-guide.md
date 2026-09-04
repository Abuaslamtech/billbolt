# Billbolt UI/UX Analysis Rule & Evaluation Heuristic

Whenever performing frontend development, reviewing UI/UX, creating components, or evaluating screens in Billbolt, agents MUST enforce the heuristics and audit protocol defined in [UI_UX_ANALYSIS_GUIDE.md](file:///home/abuaslam/Billbolt%20App/UI_UX_ANALYSIS_GUIDE.md):

## Core Principles

1. **The 2-Second Non-Tech Merchant Rule**: If an everyday small business owner cannot understand a screen, button, or label in 2 seconds without guidance, the design has failed.
2. **Plain Human Language & Single Mental Model**:
   - Zero developer or accounting jargon (`sync` ➔ `back up`, `local storage` ➔ `saved on this device`, `bills issued` ➔ `receipts today`, `+ Product` ➔ `Add New Item`, `receipt records` ➔ `sales history`, `issue your first bill` ➔ `log your first sale`).
   - Tab bar names must never combine two conflicting mental models (e.g. use `"Sales"`, never `"Sales & Bills"`).
3. **Screen Role Clarity (Operations vs. Analytics)**:
   - Operational screens (such as **Sales** or **Inventory**) must never be clogged with ~500px of scrolling charts, line graphs, or payment breakdown progress bars. Those belong strictly on the dedicated **Reports** screen.
   - An operational screen exists for two rapid tasks: (1) trigger the operation, (2) look up records.
4. **The 3-Step Screen Rhythm (Context First, Action Second, Ledger Third)**:
   - Both the Dashboard and operational screens must follow the exact same cognitive reading sequence:
     1. **Context First**: High-level daily pulse (`TodayRevenueCard` with 4px brand gradient band)
     2. **Action Second**: Primary operational triggers (`SaleActionRow`: Record a Sale + Scan)
     3. **Ledger Third**: The records / transactions (Recent Sales on Dashboard; searchable Sales History on Sales tab)
   - Never invert this order by placing action buttons above the summary on one screen and below on another.
5. **Single Focal Anchor & No Color Wars**: Exactly one primary hero CTA per view in solid brand blue (`bg-bolt-blue`). Secondary actions must use neutral surfaces (`bg-bolt-card`) and never borrow the hero button's saturated blue.
6. **Navigation Discipline**: Never create quick chips on the dashboard that duplicate the permanent 4-tab bottom navigation bar (`Dashboard`, `Sales`, `Inventory`, `Reports`). The action area is strictly for operational triggers (`Record Sale`, `Scan`, `Add Item`, `Restock`).
7. **Semantic Color Integrity**: Green is strictly reserved for revenue, profit, customer discounts, and healthy stock states. Never use green for restocking spend. Modal submit buttons and primary actions use brand blue (`bg-bolt-blue`).
8. **Affordances & Polish**: Tappable list rows must have subtle right chevrons (`›`). Unlabeled icons must be labeled. No unicode emojis (`✓`, `👍`), no `#` hashtag symbols on ranks or search placeholders (`"Search by customer, receipt number or date..."`), and use Title Case badges (`Cash`, not `CASH`).
9. **Architectural DRY & Logic Isolation**:
   - **Hook Isolation**: Custom hooks (`useScreen.ts`) must calculate, filter, and format all data strings. The UI component contains zero calculations or string formatting.
   - **Shared DNA Components**: Reusable components (`SaleActionRow`, `TodayRevenueCard`) must be imported across screens to guarantee 1:1 geometry, haptics, and brand styling parity.
