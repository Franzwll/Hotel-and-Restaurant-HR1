# Applicant → Onboarding → Records flow, plus table toolbar cleanups

## Applicant Management

- **Assessments toolbar**: add a search box (candidate / position / remarks), a status dropdown (Ready for Assessment, Recommended, Hold, Not recommended), and a department dropdown, arranged on the right of the card header next to the existing Ready/Completed/All filter.
- **Assessments sorting**: make every column head sortable (Candidate, Position, Score, Status, Details) using the shared sort helper. The table currently renders two hardcoded row lists; it will be rendered from the already-computed combined row list so sorting applies across both.
- **History & Audit toolbar**: move the search box and the Action / Department / Actor dropdowns to the right side of the card header (title and description stay left), matching the Assessments layout.
- **Accept decision routes to onboarding**: accepting an assessment marks the applicant Hired, then opens the New Hire "Add hire" modal pre-filled with full name, position, department, email and phone from the applicant record, plus a note that the account password defaults to the system default. Confirming creates the hire in Pre-onboarding. Reject keeps today's behaviour (status Rejected + audit entry).

## Shared hire data

Accepted hires must be visible in New Hire Onboarding and Employee Records, so the hire list moves out of component state into a small shared store (same pattern as the existing requisitions store). Adding a hire, from either the Applicant Management accept flow or the Add New Hire button, immediately creates an Employee Records entry (employee ID, name, position, department, contact, hire date, Probationary status).

## Recruitment & Onboarding — Vacancy Requisitions

- **New indicator**: a "New" badge on requisitions requested within the last 7 days.
- **Toolbar**: search bar plus dropdown filters (status, department, urgency) on the right of the card header.
- **Pagination**: 5 requisitions per page with page controls and a "showing X–Y of Z" label, resetting to page 1 on any filter/search change.

## New Hire Onboarding

- **List card header**: search box, department dropdown, stage dropdown and the Add New Hire button all sit on the right side of the hire-list card header.
- Remove the **Edit** button from the upper area of the checklist (above the checkboxes); the edit action stays only in the bottom action row with Advance / Mark all done.
- **Status tracker line**: the connector segment currently only fills from step 1 onward, so selecting Pre-onboarding shows no colored line. Fix so the segment under the selected stage is filled (Pre-onboarding shows a filled first segment) in the theme's red/primary.
- Adding a hire also creates the Employee Records entry (see shared hire data).

## Employee Records

- Replace the auto-archive years dropdown with a number input with − / + steppers (1–30 years); changing it re-runs auto-archiving and updates the "Archived (N+ years)" label.

## ESS Management

- **Activity Log toolbar**: reorder to search bar first, then the filter dropdowns, with the dropdowns pushed to the right edge of the header row.

## Technical notes

- New `src/data/hires.ts` store (`useSyncExternalStore`, like `src/data/requisitions.ts`) holding hires + checklists; `NewHireOnboarding.tsx` reads from it instead of local `seedHires` state, and `EmployeeRecords.tsx` merges store hires into its list.
- Applicant accept handler writes the applicant to a pending-hire slot in the store and navigates to the onboarding route with the add-hire modal open and pre-filled.
- `ApplicantManagement.tsx`: render assessment rows from `assessmentSort.sorted` with `SortHead`; add `assessmentSearch` / `assessmentStatus` / `assessmentDept` state; restructure the audit card header for right-aligned controls.
- `RecruitmentManagement.tsx`: requisition search/filter/page state over `useRequisitions()`; "New" badge from `requestedAt` within 7 days of today.
- `NewHireOnboarding.tsx`: tracker fill width uses `(index + 1)` segments; header controls grouped in one right-aligned flex row.
- `EmployeeRecords.tsx`: `archiveYears` becomes a numeric stepper input calling the existing `applyArchiveYears`.
