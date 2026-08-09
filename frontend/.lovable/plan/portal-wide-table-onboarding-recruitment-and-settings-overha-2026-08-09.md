# Portal-wide table, onboarding, recruitment and settings overhaul

Frontend-only work across the existing modules. No backend; only local fixture fields needed for new UI state.

## 1. Tables and lists (global)

Applies to: Applicant List, Scheduled Interviews, Assessments, History & Audit, Vacancies & Postings, Vacancy Requisitions, Pre-onboarding List, Employee List (Records + Core HCM), Record History, Employee Requests, ESS Activity Log, User List, Audit Logs.

- `TablePagination` always renders, even with 0-9 rows. Page buttons stay visible but disabled (Previous / "1" / Next), styled as today so nothing shifts.
- Every list card gets a minimum body height so the card does not shrink when a search returns 1-9 rows or nothing.
- Empty state shows a single centered label derived from that list's own search placeholder - e.g. placeholder "Search departments..." produces "No departments match your search". Implemented once as a shared helper so every list stays consistent.

## 2. Section tabs colour treatment

Selected tab = burgundy/red (primary) with light foreground; unselected tabs turn gold/yellow on hover - matching the pagination button colours. Applied to Applicant Management, Recruitment Management, ESS Management, and reused elsewhere for consistency.

## 3. New Hire Onboarding

- Remove the Regular stage from the Onboarding Status Tracker, remove the Regular list, and remove the Regular metric card.
- Replace it with a clickable "Awaiting Evaluation" metric card (hires whose evaluation has been requested) that filters the list to those hires.
- Icons added to Total New Hires, Pre-onboarding, Probationary and the new card.
- In Probationary, the action button becomes "Request for Evaluation". Once requested, that hire's card switches to a waiting state - pulsing spinner, muted styling, "Waiting for performance evaluation" plus request timestamp - and the button is disabled.
- "Advance to Probationary" is enabled only when the checklist is 100% complete and the edit has been saved (not while editing, not with unsaved changes).
- New "Checklist Requests" section: incoming checklist requests with their notes, plus an inline builder to create a checklist (title, items, target stage, notes) that then becomes available to hires. Presented as an internal HR request queue with no mention of an external source.

## 4. Applicant Management

- Total Applicants, Passed Screening and Ready to Assess become clickable and filter the Ranking & Applicants list.
- Add Applicant modal: move Full name, email, contact number, address and phone from step 2 into step 3, grouped with the file/photo upload. Step 3's screening output uses the same "Resume Screening Result" layout as Review, keeping the Retry analysis action.
- Interview Scheduling:
  - Slot Settings button moves into the Interview Calendar card, directly under the Today / Previous / Next row. The "14 slots - 14 applicants each - 30 min - walk-in allowed" summary line is removed.
  - Search input plus a dropdown filter added to the right of the "Interviews on <date>" heading, inside the existing card width (no layout growth).
  - "Choose Date" removed from both the Interview Calendar card and the Book an Interview card.
  - Time slot selection becomes a dropdown; the walk-in option is removed from the booking flow.
- Slot Settings modal rebuilt to match `slotsettings_reference.png`: two columns - left with Capacity (interviewers, rooms, computed max concurrent), Time Configuration (first slot, duration, number of slots), Break Slot with toggle and quick presets, Other Options; right with Daily Schedule Preview listing each slot as Available/Break, and a Summary checklist. Footer: Reset to default / Save settings.

## 5. Recruitment Management

- Tab colours as in section 2.
- Icon added to Positions Filled; Active Postings, Total Vacancies, Positions Filled and Applications Received all clickable, filtering or routing to the relevant tab.
- Vacancy Requisitions list rewritten onto the same aligned column grid as the Vacancies & Postings list view: Ref Number, Department, Openings, Urgency badge, Status badge, Requested - consistent column widths, badge sizes and alignment.
- Job Post Builder: the bottom "Request Note" block is removed. The right-hand preview card becomes two stacked sections - **Requested Note** (same content as the current view-note modal) and **Preview**.
- Preview channels reworked to imitate the references:
  - Website - serif headline, meta line, peso range, Job Description / Responsibilities / Qualifications with tick bullets, Benefits chips (`website_jobposting.png`).
  - Indeed - card header with title, company link, location, salary chips, Apply with Indeed button, Job details / Location / Full job description sections (`indeed_jobposting.png`).
  - Facebook and Instagram - post chrome (avatar, handle, date, action icons) plus the `Template.png` hiring creative, with the position text overlaid on the template and driven by the position set in the builder (`fb_jobposting.png`, `ig_jobposting_*.png`).
- `Template.png` is registered as a project asset so the social previews can render it.

## 6. Employee Records

- Icons on Regular and Probationary metric cards; both clickable, equal size and height-aligned with the rest of the row.
- "View 201 File" renamed to "View Records" with an icon.
- Inside the record view, Edit Personal Data and Edit Employment merge into one Edit Record flow covering both sections, plus a Generate Report action producing a printable summary of the record.

## 7. ESS Management

- Icons on Pending, Under Review, Approved and Completed metric cards.
- Tab colours as in section 2.
- ESS Administration gains creation of additional ESS request categories (name, description, approver, active toggle); new categories flow into the employee request form and the admin queue filters.

## 8. Settings

Rebuilt to match `settings_reference.png`: a responsive grid holding three cards per row on wide screens, degrading to two then one, with Notifications (toggles), Preferences (theme, language, date/time format, timezone), Login Security (2FA, password policy, session timeout, max attempts), Company (name, email, contact, business hours, address), and a wider Backup & Restore card with Create backup, an automatic-backups strip, and the backup table with Download/Restore actions.

## 9. Profile

Rebuilt to match `profile_reference.png`: left sidebar card with burgundy header, large circular initials avatar with camera badge, name, role, Active badge, Change Photo button, upload hint, and an icon list (Employee ID, Department, Date Created, Last Login). Right side: Profile Information / Account Details tabs, Personal Details and Account Details field grids with icons and a read-only Active status field, and an Edit Profile action bottom-right.

## Technical notes

- Shared changes: `src/components/ui/table-pagination.tsx` (always-visible disabled pagination), `src/components/ui/tabs.tsx` (or a shared `TabsList` variant) for the red/gold treatment, a small shared empty-state component that derives its message from the search placeholder, and `StatCard` icon/clickable usage.
- Module files touched: `NewHireOnboarding.tsx`, `ApplicantManagement.tsx`, `RecruitmentManagement.tsx`, `EmployeeRecords.tsx`, `EssManagement.tsx`, `AdminModules.tsx` (Settings, User List, Audit Logs), `CoreHCM.tsx`, `ProfilePage.tsx`, plus fixture additions in `src/data/hires.ts` (evaluation-request state, checklist requests) and `src/data/ess.ts` (custom categories).
- All colours use existing semantic tokens in `src/styles.css`; no hardcoded colour utilities.
- Given the size, work lands module by module in the order above so each area is verifiable as it ships.

## Assumptions

- The new onboarding metric card is "Awaiting Evaluation"; easy to rename.
- The unfinished "Add" line under ESS Management is read as the category-creation item above - tell me if something else was intended.