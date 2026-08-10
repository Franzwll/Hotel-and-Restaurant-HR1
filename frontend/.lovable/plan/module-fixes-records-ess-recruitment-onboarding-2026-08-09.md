# Module Fixes — Records, ESS, Recruitment, Onboarding

## Employee Records

- In the employee profile modal, the tab strip and the action row (Edit / Delete / Add document / Create history entry) currently change height per tab, which pushes the content down when switching sections. The action row gets a fixed-height reserved slot and the tab body gets a fixed minimum height with internal scrolling, so Personal Information, Documents and Employment History all start at the same vertical position.

## ESS Management

- Bulk approve and bulk reject restyled to the system palette (success and destructive tokens) instead of the current default styling.
- Row action buttons get icon plus text label: Approve, Reject, Review, Employee replied.
- Category Management: the create-category form (name, description, request types) moves to the top of the card as a collapsible "New category" button — clicking expands it, clicking again collapses it.
- Each category row gets a toggle button placed between Edit and Delete that opens or closes the category for new requests. Closed categories are marked in the list and hidden from the employee request form.
- The Workflow, Policies & SLA panel is reorganized to read as request-management settings that sit alongside the new open/close control (intake state, auto-close rules, SLA per category).

## Recruitment Management

- Convert to job post becomes an icon-plus-label button using a navigation-style icon (arrow going into a box) instead of the current icon-only button.
- The Website / Facebook / Instagram / Indeed preview tabs render as a single non-scrolling row that always fits the card width (equal-width triggers, condensed labels/icons at narrow widths) rather than an overflow-scroll strip.

## New Hire Onboarding

- List toolbar: search, department filter, stage filter, slot settings (restyled to a plain white/outline control) and Add New Hire all align to the right side of the row.
- Requested Checklists tab: the Requested Checklists card and the Checklist Builder card share one equal, fixed height and do not shrink or grow with the amount of data; overflow scrolls inside each card.
- Checklist Builder: the creation form is hidden behind a Create checklist button and only appears when that button is clicked (collapses again on cancel/save).
- Checklist edit mode gains editable Stage (Pre-onboarding / Probationary) and Applies-to position controls, not just title and items.
- Onboarding Pipeline: when a hire is selected, their requirements checklist is always expanded — no collapsed state.

## Technical notes

- Frontend-only, against the existing in-memory stores in `src/data`; no backend changes.
- ESS categories gain an `open` boolean (default true) in `src/data/ess.ts`, consumed by both ESS Management and the employee request form.
- Equal card heights via a grid with `items-stretch` plus `h-full` cards and a fixed `min-h`/`max-h` body with `overflow-y-auto`.
