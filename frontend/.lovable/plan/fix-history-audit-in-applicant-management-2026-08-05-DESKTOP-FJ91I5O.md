# Fix History & Audit in Applicant Management

## What's wrong

The "History & Audit" tab button renders, but clicking it shows an empty page. The tab trigger exists at `ApplicantManagement.tsx:687`, and all the supporting logic is already written — the audit log state, `addAudit()` writer, search, action/department/actor filters, and the sortable-column setup (`auditFiltered`, `auditSort`, lines 316-614). What is missing is the panel itself: there are only three `TabsContent` blocks (ranking, scheduling, assessment) and none for `history`.

## The fix

Add the missing History & Audit panel, wired to the logic that already exists:

- A card headed "History & Audit" with a short description of what the log records.
- Toolbar on the right: search box plus dropdowns for Action type, Department, and Actor (all options already derived from the log data), and a Reset button when any filter is active.
- Table with sortable headers on every column: Date & time, Actor, Position, Department, Action, Applicant, Module, Details. Action type shows as a colored badge.
- Empty state row when filters match nothing, and a "showing X of Y activities" count.
- Existing seeded history (25 entries covering applicant added, interview booked/completed/cancelled/no-show, transfers, assessment started/accepted/rejected, status changes) appears immediately, and any new action taken in the module prepends a live entry.

## Technical notes

Single edit in `src/components/modules/ApplicantManagement.tsx`: insert `<TabsContent value="history">` after the assessment panel, rendering `auditSort.sorted` through the shared `SortHead`/`useSort` helpers from `src/components/portal/sortable.tsx`. No data-layer or state changes needed — `auditFiltered`, `auditSort`, `auditActionTypes`, and `auditActors` are already computed and currently unused.
