# Login left panel: unified portal messaging

Frontend text/UI only in `src/routes/login.tsx`. No auth logic, no layout rebuild, same photo, scrims, palette, role tabs and OTP flow.

## Why

The login is a shared entry point for the whole Oxford Suites Makati system, not just HRMS. The left panel currently reads as an HR-only product ("Hotel & Restaurant Human Resource System"), so it needs to speak for every subsystem.

## New left panel content

- Badge (top right): "Unified Access" instead of "Staff Portal".
- Headline: "Hotel & Restaurant / Enterprise Operations Platform".
- Supporting line: one sign-in for every Oxford Suites Makati subsystem — hotel, restaurant, and back-office operations.
- New: a compact subsystem list replacing the plain paragraph-only stack, grouped at the top level of the architecture so it stays short and readable:
  - Human Resource & Workforce — recruitment, core HR, payroll, performance
  - Financial Management — ledger, payables, receivables, budgeting
  - Supply Chain & Inventory — warehousing, procurement, logistics
  - Fleet & Transportation — vehicles, dispatch, trip monitoring
  - Facilities & Administration — reservations, documents, legal
  - Hotel Management — reservations, front office, housekeeping, billing
  - Restaurant Management — tables, menu, orders, KOT, POS
- Facts row updated: Client → Oxford Suites Makati; Subsystems → 7 domains; Access → Role-based SSO. Front-desk number moves out (kept on the contact page) so the row stays 3 items and never truncates.

Each subsystem line is a small left-aligned row with a gold tick/dot, sharing the same left alignment axis and spacing rhythm as the current design.

## Responsive handling

- The subsystem list is the only added vertical content, so it renders as a two-column wrap at 1280px+ and a single column from 1024–1279px, with the supporting paragraph shortened at narrower widths.
- On short viewports (~700px tall) the list caps to the same panel height using the existing `min-h-0` / `overflow-hidden` guards — no new scrollbars, no clipping.
- Panel is still hidden below 1024px, so mobile is unaffected.

## Right panel

Unchanged except the eyebrow: "Staff Portal Access" → "Unified Portal Access", and the subtitle wording to "Select your role, then sign in with your Oxford Suites credentials."

## Technical notes

- Single file: `src/routes/login.tsx`.
- Subsystem entries defined as a local array next to the existing `facts` array; no new data files or components.
- Head metadata description updated to reflect the unified portal wording.
