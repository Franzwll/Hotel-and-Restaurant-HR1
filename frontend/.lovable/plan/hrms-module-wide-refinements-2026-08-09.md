# HRMS Module-Wide Refinements

Work spans seven areas. All of it is frontend/presentation plus the in-memory demo stores that back these screens.

## 0. Lists and pagination (global)

The shared `ListBody` (fixed min-height) and `TablePagination` (always-visible, inert when a single page) helpers already exist and are used by most tables. Do a pass over every named list and make sure each one is wrapped in `ListBody` sized to the default page size (10) and followed by `TablePagination`, so 0, 1–9 and 10+ results all render the same card height with the pager present but disabled:

Applicant List, Scheduled Interviews, Assessments, History & Audit, Vacancies & Postings, Vacancy Requisitions, Pre-onboarding List, Probationary List, Employee List, Record History, Employee Requests, ESS Activity Log, plus the new Requested Checklists list.

## 1. Applicant Management

Metric cards
- Total Applicants → jumps to Ranking & Applicants with position, status and stage filters all reset to "all".
- Rename "Scheduled Interviews" → "Today Scheduled Interviews"; click filters Scheduled Interviews to today's date only.
- "Ready to Assess" → switches to the Assessment tab and filters that list to ready-to-assess rows only.

Add Applicant modal (step 3)
- Reorder: "Applying for" dropdown first, then Full name, Email, Contact number, Phone, Address, then the file/photo uploader at the bottom of the step.
- Add a left-side preview pane showing the uploaded resume/photo, matching the Review modal used for screening results.

Interview Scheduling
- Move the "Slot settings" button into the Interview Calendar toolbar, under Today / Prev / Next / Preview. Remove the "14 slots · 14 applicants each · 30 min · walk-in allowed" summary line.
- Add a search input and a filter dropdown on the right of the "Interviews on <date>" heading, without changing the card's outer size.
- Remove the "Choose date" control from both the Interview Calendar card and the Book an Interview card.
- Turn time-slot selection into a dropdown; remove the walk-in option from booking.

Slot Settings modal — rebuild to match `slotsettings_reference.png`: two columns. Left: Capacity (interviewers, rooms, computed max concurrent interviews), Time configuration (first slot, duration, number of slots), Break slot with toggle + start/end + quick presets, Other options (walk-in toggle, default interview type). Right: Daily Schedule Preview listing generated slots with Available/Break state, plus a Summary checklist. Footer: Reset to default / Save settings.

Assessment
- Accepting a candidate removes their row from the Assessments list (same as reject) and adds them to the onboarding list.

## 2. Recruitment Management

- Replace "Applications Received" with a pending-requisition metric; clicking shows only pending requests in Vacancy Requisitions.
- Replace "Positions Filled" with "High Urgency"; clicking filters Vacancy Requisitions to high-urgency rows. Remove the "new" indicator.
- Align Vacancy Requisitions columns and badge styling (status pending/approved, urgency high/low/normal/new, Ref number, Department, Openings, Requested) with the Vacancies & Postings list.
- Add a status action on Requisitions from Core HCM to move Pending → Approved (labelled Done).
- Rework the job-post previews so each channel imitates its reference, driven entirely by the Job Post Builder inputs:
  - Website: serif headline, meta line, salary, Job Description / Responsibilities / Qualifications / Benefits sections.
  - Facebook and Instagram: post header, caption body, and the `Template.png` hiring card with the builder's job position composited into the POSITION area.
  - Indeed: job-details chips (pay, job type), Location, Full job description.
  - Add a "Preview post" button opening the selected channel preview in a modal.

## 3. New Hire Onboarding

- Remove the inline "Requested Checklists" block and add a Requested Checklists tab alongside the existing tabs. It lists checklists requested by Performance (reference material) and hosts creation of the master probationary checklist applied to all employees, with edit and delete per checklist.
- Add an auto-regularization setter: when an employee has completed their checklist and requested evaluation, and the configured waiting period elapses, they are regularized automatically, move to HCM, and drop off the Probationary list.
- Remove the "Currently waiting for evaluation" block from the checklist card and from the Probationary list.
- Checklist card after Save + Request for Evaluation: hide the checklist and all its buttons, recolour the requirement bar and the whole card gold/amber, and animate a panel sliding up from the bottom to cover the checklist area, showing a large bold "Waiting for Evaluation" label with a large loading indicator beneath it, and a Cancel button below the panel that restores the previous UI.
- Probationary List: a requested employee's row turns from green to amber and its requirement bar is replaced by the loading indicator + "Waiting for evaluation" label; cancelling restores the original row UI.

## 4. Employee Records

- Widen the View Record modal so the information fits without scrolling.
- Make the Inactive metric card clickable, filtering the Employee List to inactive employees.

## 5. ESS Management

- Left card: Category management — fully visible without scrolling, no Approver field on create, Description optional and used as the placeholder shown to employees when requesting, and edit/delete for every existing category.
- Right card: merge Request Types into "Workflow, Policies & SLA".

## 6. Settings

- Rebuild as a responsive card grid: three cards per row, remaining 1–2 cards sharing the final row, matching `settings_reference.png` (Notifications, Preferences, Login Security, Company, Backup & Restore).
- Company card visible to Super Admin only, hidden for Admin.

## 7. Profile

- Rebuild to imitate `profile_reference.png`: left identity column (avatar with camera badge, name, role, Active badge, Change Photo, and Employee ID / Department / Date Created / Last Login rows) plus right tabbed panel (Profile Information, Account Details) with the field grid and Edit Profile action.
- Admin: "Change Password" links to Settings. Super Admin: the Change Password control is not shown.

## Technical notes

- Files touched: `ApplicantManagement.tsx`, `RecruitmentManagement.tsx`, `NewHireOnboarding.tsx`, `EmployeeRecords.tsx`, `EssManagement.tsx`, `AdminModules.tsx` (Settings), `ProfilePage.tsx`, plus stores in `src/data/` (`hires.ts` for master checklists/auto-regularization, `applicants.ts`, `requisitions.ts`, `ess.ts`).
- `Template.png` becomes a project asset via the asset pointer flow; the position text is overlaid in the DOM over the image so it always reflects the builder input.
- New shared pieces likely extracted: slot-settings dialog, job-post channel previews, waiting-for-evaluation overlay.
- Colours stay on existing semantic tokens; a gold/amber "waiting" tone is added to `src/styles.css` if one is not already defined.
