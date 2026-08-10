# Portal-wide list heights, module fixes and Settings/Profile rebuild

Frontend-only. Local fixture fields added where new UI state is needed; no backend.

## 1. All tables and lists (global)

Applies to: Applicant List, Scheduled Interviews, Assessments, History & Audit, Vacancies & Postings, Vacancy Requisitions, Pre-onboarding List, Employee List (Records + Core HCM), Record History, Employee Requests, ESS Activity Log, User List, Audit Logs.

- Pagination footer already always renders and disables its buttons when there is a single page; keep that and apply it to any list still missing it.
- Give every list body a fixed minimum height equal to a full page of rows (10 x row height), so 0, 1-9 or 10+ results all render the same card height. Fewer rows leave blank space below instead of shrinking the card.
- Empty state stays the shared centered message derived from each list's own search placeholder.

## 2. Applicant Management

- Metric cards:
  - Total Applicants -> clears every filter (all positions, statuses, stages) and shows the full applicant list.
  - Scheduled Interviews -> relabelled "Today Scheduled Interviews", counts and opens only interviews scheduled for today.
  - Ready to Assess -> jumps to the Assessments section filtered to applicants ready for assessment.
- Add Applicant modal, step 3: Full name, email, contact number, address and phone move directly below the "Applying for" dropdown; file/photo uploader sits below those fields. The uploaded resume/photo previews on the left, matching the Resume Screening Result layout used by the Review modal.
- Interview Scheduling:
  - Slot Settings button moves into the Interview Calendar card, directly under the Today / Previous / Next row. The "14 slots · 14 applicants each · 30 min · walk-in allowed" summary line is removed.
  - Search input plus a dropdown filter added to the right of the "Interviews on <date>" heading, inside the existing card width.
  - "Choose Date" removed from the Interview Calendar and Book an Interview cards.
  - Time slot selection becomes a dropdown; the walk-in option is removed from booking.
- Slot Settings modal rebuilt to `slotsettings_reference.png`: left column with Capacity (interviewers, rooms, computed max concurrent), Time Configuration (first slot, duration, number of slots), Break Slot with toggle and quick presets, Other Options; right column with Daily Schedule Preview (each slot Available/Break) and a Summary checklist. Footer: Reset to default / Save settings.
- Assessments: accepting a candidate removes their row from the Assessments list (same as Reject) and adds them to the onboarding list.

## 3. Recruitment Management

- Metric cards: "Applications Received" becomes **Pending Requisitions** (count of pending requests from Core HCM; clicking filters Vacancy Requisitions to pending). "Positions Filled" becomes **High Urgency** (clicking filters Vacancy Requisitions to high urgency). The "new" indicator is removed.
- Vacancy Requisitions list rewritten onto the same aligned column grid as the Vacancies & Postings list view: Ref Number, Department, Openings, Urgency badge, Status badge, Requested - consistent column widths, badge sizes and alignment.
- Requisitions from Core HCM gain a row action to move status Pending -> Approved (Done).
- Channel previews reworked to the references, all driven by the builder's inputs:
  - Website - serif headline, meta line, peso range, Job Description / Responsibilities / Qualifications with tick bullets, Benefits chips (`website_jobposting.png`).
  - Indeed - card header with title, company link, location, salary chips, Apply with Indeed button, Job details / Location / Full job description (`indeed_jobposting.png`).
  - Facebook and Instagram - post chrome (avatar, handle, date, action icons) plus the hiring creative from `Template.png`, with the position text overlaid on the template from the builder's job position (`fb_jobposting.png`, `ig_jobposting_*.png`).
- New "Preview post" button opens the selected channel preview full-size in a modal.

## 4. New Hire Onboarding

- Remove the current Requested Checklists block and replace it with a dedicated **Requested Checklists** section: incoming checklist requests from Performance, used as reference when building the master probationary checklist. Checklists created there apply to all employees and can be edited and deleted.
- Add an auto-regularization setting: if a hire has completed the checklist and requested evaluation, and the wait exceeds the configured number of days, they are regularized automatically, removed from the Probationary list and handed to Core HCM.
- Remove the current "waiting for evaluation" treatment in the checklist card and probationary list, replaced by:
  - After the edit is saved and "Request for Evaluation" is pressed, all checklist items and buttons disappear; the requirement bar and the whole card turn gold/yellow; a box animates up from the bottom to cover the checklist area, showing a large bold "Waiting for Evaluation" label with a large loading icon beneath it, and a Cancel button just below the box that restores the previous UI.
  - In the Probationary list, a requested hire's row turns from green to yellow and its requirement bar is replaced by a loading icon with "Waiting for evaluation"; cancelling restores the original row.

## 5. Employee Records

- View Records modal widened so the record is readable without scrolling.
- Inactive metric card becomes clickable and filters the list to inactive employees.

## 6. ESS Management

- Category management fits in its card with no inner scrolling.
- Request Types merged into the Workflow, Policies & SLA card; the left card becomes Category Management.
- Category creation drops the Approver field and makes Description optional; the description is used as the placeholder shown to employees in the request form.
- Existing categories can be edited and deleted.

## 7. Settings

Rebuilt to `settings_reference.png`: responsive grid, three cards per row on wide screens degrading to two then one, with leftover cards sharing a row. Cards: Notifications (toggles), Preferences (theme, language, date/time format, timezone), Login Security (2FA, password policy, session timeout, max attempts), Company, and a wider Backup & Restore card with Create backup, automatic-backups strip and the backup table with Download/Restore. The Company card is hidden for admin and visible only for super admin.

## 8. Profile

Rebuilt to `profile_reference.png`: left sidebar card with burgundy header, large circular initials avatar with camera badge, name, role, Active badge, Change Photo button, upload hint, and an icon list (Employee ID, Department, Date Created, Last Login). Right side: Profile Information / Account Details tabs, Personal Details and Account Details field grids with icons and a read-only Active status field, Edit Profile bottom-right. "Change Password" links through to Settings for admin, and is hidden for super admin.

## Technical notes

- Shared: a `min-h` list-body wrapper sized to the default page size, reused by every list; existing `TablePagination` and `ListEmptyState` stay as-is.
- Files touched: `ApplicantManagement.tsx`, `RecruitmentManagement.tsx`, `NewHireOnboarding.tsx`, `EmployeeRecords.tsx`, `EssManagement.tsx`, `CoreHCM.tsx`, `AdminModules.tsx` (Settings, Users, Audit), `ProfilePage.tsx`, plus fixture fields in `src/data/hires.ts`, `src/data/requisitions.ts` and `src/data/ess.ts`.
- `Template.png` is already registered as a project asset (`src/assets/hiring-template.png.asset.json`) and is used for the social previews.
- All colours use existing semantic tokens; no hardcoded colour utilities. Animations via CSS/Motion-style transitions.
- Work lands module by module in the order above so each area is verifiable as it ships.
