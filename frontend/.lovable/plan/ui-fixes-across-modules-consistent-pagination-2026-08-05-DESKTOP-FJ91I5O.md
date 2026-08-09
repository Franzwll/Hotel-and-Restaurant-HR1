# UI fixes across modules + consistent pagination

## 1. Applicant Management — Scheduling cards
"Interview Calendar" and "Book an Interview" sit side by side but grow to different heights because the grid is set to `items-start`. Make the two cards always equal height: stretch the grid row, let each card fill the row, and let the inner content area flex so the shorter card's body expands instead of leaving a ragged edge.

## 2. Recruitment → New Hire Onboarding handoff (full name)
When an applicant is accepted after assessment, the Add New Hire modal opens pre-filled. Position, department, email and phone come through, but the name is bound to an applicant dropdown that only lists seeded applicants, so an accepted applicant's name can render blank.

Fix: when the modal is opened from an accepted applicant, show the full name as a pre-filled, read-only field (with the applicant's details already set). The selectable applicant dropdown stays only for manual entry.

## 3. New Hire Onboarding — clicking "Add New Hire" directly
Opening the modal manually must start clean: name, position, department, email and phone empty/unset, with only the start date defaulted to today. Reset the form on every manual open (and on close), so leftover values from a previous accepted-applicant handoff never persist.

## 4. Employee Records — Auto-archive
Replace the inline "Auto-archive after [ − N + ]" stepper in the toolbar with a single icon-only button (archive icon, with tooltip/aria-label). Clicking it opens a small modal where the user sets the auto-archive threshold in years, sees how many records that would archive, and confirms or cancels. The threshold only applies once saved.

## 5. User Management — System Users search bar
The search input currently stretches across the toolbar. Give it a fixed, regular width (matching the filter dropdowns' scale) and group it inline with the Role and Status dropdowns as one filter row.

## 6. Pagination everywhere, 10 per page
Standardise pagination on every data table in the app:

- Applicant Management (applicant lists, interviews, assessments)
- Recruitment Management → Vacancies & Postings and Vacancy Requisitions: currently 5 per page, raise to 10
- Core HCM (including its requisition table, currently 5)
- Employee Records
- New Hire Onboarding hires table
- ESS Management / Employee ESS tables
- User Management: System Users and Audit Log

Each table gets: max 10 rows per page, a "Showing X–Y of Z" label, page number buttons with Previous/Next, and an automatic reset to page 1 whenever search/filter/sort changes.

## Technical notes
- Extract a shared `TablePagination` component plus a `usePagination` hook so all tables use identical logic and markup, instead of repeating the ad-hoc `PAGE_SIZE` blocks now duplicated in RecruitmentManagement and CoreHCM.
- Equal card height via `items-stretch` grid + `h-full` card and `flex flex-col` content, no fixed pixel heights.
- Auto-archive modal reuses the existing dialog components; the years value stays local until confirmed.
