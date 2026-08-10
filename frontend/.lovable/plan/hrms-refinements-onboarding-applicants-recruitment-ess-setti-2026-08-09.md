# HRMS refinements: onboarding, applicants, recruitment, ESS, settings

## New Hire Onboarding

**Evaluation card polish + gold bars**
- Redesign the "Ready for performance evaluation" / "Waiting for evaluation" cards: tighter header, cleaner stat pair, clearer primary action, softer dividers and spacing.
- Keep every checklist progress bar (list rows and the detail card, including the 100% state) - only recolor them gold instead of the current tones.
- Remove the "Auto-regularization in X ..." line from the waiting card. The setting is no longer shown on cards.

**Auto-Regularization settings button**
- Small icon button (shield/clock icon, tooltip "Auto-regularization") placed immediately to the left of the "Add New Hire" button in the page header.
- Opens a modal with two numeric inputs: months and days, phrased as "Auto-regularize after [X months and X days] of waiting on evaluation." Save/Cancel; the value feeds the existing auto-regularization timer logic.

**Requested Checklists rework**
- Remove the current "Requested Checklists" block (request note then build checklist for one employee).
- New "Requested Checklists" section: reference-only list of items requested by Performance, each row holding a Checklist Item and a Job Position dropdown (a specific position, or "Select All" for every position). Rows can be added, edited and deleted. They are reference material for building the master checklist, not attached to a single hire.
- "Master Probationary Checklist" stays the real source of items applied to every probationary employee, with add / edit / delete on each checklist and item.
- Re-arrange the tab so Master Probationary Checklist and Requested Checklists sit as two balanced side-by-side cards (stacked on small screens), master first.

**Evaluation gating**
- "Request for evaluation" is hidden entirely (no locked placeholder) until the probationary checklist is both 100% complete and saved.
- It reveals automatically the moment the checklist is saved complete - including when an existing hire is edited to completion.

## Applicant Management

**Slot Settings**
- Move the Slot Settings trigger to the top-right of the Interview Calendar card, directly below the Previous / Today / Next row.
- Rebuild the modal to match the reference: a wide two-column dialog - left column Capacity (per time slot), Time Configuration, Break Slot (unavailable time), Other Options; right column Daily Schedule Preview plus Summary. Width widened and vertical rhythm compressed so the whole modal fits on screen without scrolling in landscape.
- Slots in the Daily Schedule Preview become clickable to pick the break window directly.
- Available Interviewers and Available Rooms are linked one-to-one: changing one mirrors the other, and max concurrent interviews equals that number.

**Scheduled Interviews**
- Remove the "View" action and drop "Completed" from the status options/filters.

**Scheduling form**
- When an applicant is accepted and scheduled from Resume Screening Results, "Filter by department" auto-selects the department derived from that applicant's position/job.
- Add a date input as step 2, right after the applicant dropdown, auto-filled from the date currently selected in the interview calendar.

## Recruitment Management

- Vacancy Requisitions column order becomes: Ref Number, Department, Openings, Requested, Urgency, Status, actions.
- Add a status action button to the left of "Convert to job post": toggles a requisition between Pending and Done (replacing the Approved label), and back again.
- Rework the platform previews to closely imitate the references: Website (serif headings, peso range, description / responsibilities / qualifications / benefit chips), Indeed (header card, Apply with Indeed, job detail chips, structured description), Facebook and Instagram (page header, post copy, poster image, engagement row).
- Facebook and Instagram previews render the Oxford Suites hiring template with the position from the Job Post Builder overlaid in the POSITION slot.
- Add a poster photo upload control in the Job Post Builder editor so the user can supply their own image for the FB/IG posts, falling back to the default template.

## ESS Management

- Merge the standalone "Request types" toggles into Category Management: each category row gets its own toggle.
- The right-hand card keeps only workflow settings: Approval levels, SLA first response, SLA resolution and the related policy switches.

## Settings

- Make Manage notifications, Edit preferences, Manage security and Edit company info actually apply: dialog values are held in state and saved values update the summary cards on the page instead of only firing a toast.
- Give the Backup & Restore table a fixed-height scrollable body so the card height stays constant as backups accumulate.

## Technical notes

Files touched: `src/components/modules/NewHireOnboarding.tsx`, `ApplicantManagement.tsx`, `RecruitmentManagement.tsx`, `EssManagement.tsx`, `AdminModules.tsx`, plus `src/data/hires.ts` (requested-checklist reference records) and `src/data/requisitions.ts` (Done status + store action). The hiring template already exists as a Lovable asset pointer (`src/assets/hiring-template.png.asset.json`) and will be reused for the IG/FB previews with the position drawn over it. All colors use existing semantic tokens (gold, primary, success); no hardcoded color utilities. No backend work - everything stays in the in-memory fixtures.
