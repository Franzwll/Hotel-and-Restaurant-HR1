# HR Portal — Module Refinements

A pass across five modules: calendar controls, interview statuses, requisition layout, job post builder, onboarding checklists, employee records fixes, and ESS category management.

## Applicant Management

- Calendar header: the slot settings gear moves inline with the pager — one row: Today, previous, next, gear.
- Scheduled Interviews gains a "Need to Schedule" status covering accepted applicants with no booking yet (caution badge, dash for schedule/interviewer). The "Completed" filter option is replaced by "Need to Schedule".
- New Actions column: Need-to-Schedule rows get **Schedule**; Scheduled rows get **Reschedule** and **Cancel** (cancel sends the row back to Need to Schedule).

## Recruitment Management

**Vacancy Requisitions**
- Column order: Ref Number, Department, Openings, Requested, Urgency, Status, status editor, view note, convert (icon).
- One compact horizontal row each — nothing stacked, no wrapping button group, reduced row height with truncation.
- Status becomes an inline editable dropdown toggling Pending and Done.
- Convert to job post becomes an icon button with a tooltip.

**Job Post Builder**
- The Preview heading and Preview post button move below the preview.
- Poster photo upload leaves the preview area and becomes the hiring picture control inside the Social Media Links block.
- Requested Note gets a dropdown of all Pending requisitions when the post came from create, edit template, or copy and use template. Selecting one previews that requisition's note; with none selected it keeps "This posting wasn't sourced from a staffing request — no requested note on file."
- Facebook and Instagram previews switch to light mode, matching the Website preview.
- Website, Facebook, Instagram and Indeed tabs stay on a single horizontal row.

## New Hire Onboarding

- Request-for-evaluation card gets a UI polish (clearer header, status band, tighter spacing); the progress bar stays.
- The bar is green by default and gold only for hires who already requested evaluation.
- The checklist item list is hidden on that card; the bar and the 100% figure stay visible.
- A small Auto-Regularization icon button sits left of Add New Hire, so the row reads: search, filter dropdown, Auto-Regularization, Add New Hire.
- Requested Checklists tab becomes two cards. Left: reference checklist requests from Performance. Right: checklist creation and management (edit, delete, active, close) with checklist name, a phase dropdown (Pre-onboarding or Probationary), and an applies-to control (all positions, or selected positions via checkboxes).
- Request for evaluation appears only when every probationary item is done and the edit was saved; unsaved edits keep it hidden. Once requested, only Cancel shows.

## Employee Records

- The record modal keeps a stable height so sparse sections no longer shrink it.
- Delete record restyled with the destructive token treatment.
- Department, Status and Immediate supervisor become dropdowns in edit mode instead of text inputs.
- Bug fix: the Inactive card sets a status filter that is never cleared by the other cards, so Total / Regular / Probationary appear dead. Each card now sets its own filter and resets the others.

## ESS Management

- Bulk approve and bulk reject restyled to the system palette (success and destructive tokens).
- Row action buttons get icons plus labels (Approve, Reject, Review, Employee replied).
- Category Management: the new-category form (name, description, request types) moves to the top as a collapsible panel that expands and collapses on click.
- Each category row gets an open/close toggle sitting between Edit and Delete, controlling whether that category accepts new requests; closed categories are hidden from the employee request form and marked in the list.
- Workflow, Policies and SLA panel reorganized to read as request-management settings alongside the new control.

## Technical notes

- Frontend-only work against the existing in-memory stores in src/data; no backend needed.
- Need-to-Schedule rows are derived at render time from accepted applicants that have no interview record.
- ESS categories gain an `open` boolean, defaulting to true.
- Onboarding checklist definitions gain `phase`, `positions` and `status` fields.
