# Applicant, Recruitment, Onboarding, Records and Settings refinements

All work is frontend-only against the existing in-memory demo data.

## Applicant Management

- **Interview Calendar month/year picker** — the header currently has Today / Previous / Next only. Make the "August 2026" label a clickable control that opens a small popover with a month dropdown and a year dropdown, jumping the grid to that month.
- **Book an Interview department filter** — a department dropdown already narrows the applicant and interviewer lists; keep it and make sure it also resets the chosen applicant when the department changes.
- **Start assessment date gating** — the button is always enabled today. It becomes enabled only when the booked interview date is on or before the current date; before that it renders disabled with a tooltip showing the scheduled date.
- **Decision actions replace "Advance to offer"** — completed assessment rows get **Accept** and **Reject** buttons instead. Accept moves the applicant to Offer, Reject moves them to Rejected; both write an audit entry and toast.
- **History & Audit** — the tab already exists with actor name, position, department, date/time, per-column sorting, search and dropdown filters. It gains entries for any new actions above (assessment accept/reject, calendar-driven scheduling changes) so the log stays complete.

## Recruitment Management — Vacancies & Postings

The list already has a search bar plus status and department dropdowns. Add:
- a **Date** dropdown filter (e.g. Any time / Last 7 days / Last 30 days / This year) on the posted date;
- **pagination at 5 rows per page**, with page controls and a "showing X–Y of Z" label, resetting to page 1 whenever a filter or the search changes.

## New Hire Onboarding

- **Checklist card alignment** — the "Select a hire…" placeholder card is shorter than the hire-list card next to it. Make both columns equal height so the empty state fills the same box.
- **Add New Hire modal** — Full Name becomes a dropdown of candidate names (sourced from the existing hire/applicant fixtures) instead of a free-text field; Start date defaults to today's date and remains editable.
- **Edit button placement** — in the checklist card, Edit sits on the same row as **Advance to …** and **Mark all done**, matching their height and alignment.

## Employee Records

- **Auto-archiving setting** — a control on the records page to set the archive threshold in years (default 10). Changing it re-evaluates which records are auto-archived, and the Archived view label reflects the chosen number of years.
- **View 201 File modal interactivity** — Edit Personal Data, Edit Employment and Add Document become working forms: inline editable fields with Save/Cancel that update the record in local state, and Add Document appends to the Documents list.
- **Document editing** — each row in the Documents section gets an edit action to rename the document or replace its file, plus a remove action.

## Settings

- **Layout and UI refresh** — reorganize into a cleaner responsive grid with consistent card headers, spacing and section dividers.
- **Super Admin security** — remove the personal password-change block for Super Admin; the **system-wide login policy** section stays. Admin and Employee keep their password change.
- **Company card** — remove the empty white gap by letting the inner content fill the card (content stretches to the card height rather than the card growing).

## Technical notes

- `ApplicantManagement.tsx`: month/year popover over `viewMonth`; date gate compares the interview ISO date to today; new accept/reject handlers reuse `setStage` + `addAudit`.
- `RecruitmentManagement.tsx`: add `dateFilter` and `page` state alongside the existing `search`/`statusFilter`/`deptFilter` memo.
- `NewHireOnboarding.tsx`: `items-stretch`/`h-full` on the two-column grid, name `Select`, `startDate` seeded with today's ISO date, and the Edit button moved into the action row.
- `EmployeeRecords.tsx`: threshold state feeding `isArchivable` from `src/data/records.ts`; edit/add dialogs mutating local record state.
- `AdminModules.tsx` `SettingsPage`: split the security card so the account block is role-gated off for superadmin, and restructure the company card's inner layout.
