# Portal Interactivity & Module Refinements

A pass across the top navigation, sidebar, and eight modules. Everything stays in the existing cream / beige / white / burgundy palette and uses local demo state (no backend).

## 1. Top navigation (all three portals)

- **Profile menu**: the avatar in the top-right becomes a real dropdown with **View Profile**, **Settings**, and **Logout**. Profile and Settings route to the current role's pages; Logout returns to the login screen.
- **Notifications**: the bell opens a working notification panel with a list of items, unread counts, and mark-as-read.
- **Add announcement**: an icon button inside the notification panel opens a modal where an admin writes a title and message. Posted announcements appear in an Announcements block on each role's dashboard. Stored in shared client state so it shows across portals in the session.

## 2. Sidebar

- **My Profile** moves down to sit next to Logout at the bottom of the sidebar, away from Settings.

## 3. My Profile

- Department row is hidden when the role is Super Admin.

## 4. Applicant Management

- **Ranking & Applicants**: the pie chart is centered in its card, and the four category tiles (perfect for the job, fit to other job, invalid credential, not fitted) move below the chart as a centered grid.
- **Interview Scheduling**: restore the two-card horizontal layout from the reference — Interview Calendar on the left, Book an Interview on the right, side by side on desktop and stacked on mobile. Calendar gets the fuller month grid, date count badges, legend, and the selected-day appointment list underneath, matching the reference proportions. Scheduled Interviews table stays full width below.

## 5. Recruitment Management

- Remove the **New job post** button from the page header (the one in the Vacancies & Postings toolbar remains).
- The job post builder opens directly in its customize view instead of an intermediate step.

## 6. New Hire Onboarding

- **Progress-driven promotion**: when a tracked employee's checklist hits 100%, they move to the next stage automatically (Pre-Onboarding → Onboarding → Probationary → Regular). The status tracker and the visible list update, and the checklist panel switches to the next employee in the current list.
- **Add new hire** button moves into the Hired Applicants list card toolbar.

## 7. Core HCM

- Organizational chart nodes become clickable, opening a detail popover/panel for that employee.
- Remove the "All Departments" column from the Department list card.
- Inside each position card, move the **Request Vacancy** and **Delete** actions into the filled-vacancy bar row of that position.

## 8. Employee Records

- Add a filter dropdown to the Record History table (by action type / user).
- Remove the "Generate Document for this employee" panel.
- **Bulk Generate** now opens a document-type chooser modal first (COE, payslip, contract, 201 summary, etc.), then generates the selected documents for the checked employees.

## 9. User Management

- **Permission Matrix becomes editable**: per-role, per-module permission level selectors with save/reset, still compact and scannable.
- **Active Sessions**: full list of signed-in users showing name, department, position, device, IP, last activity, plus a per-row **Revoke** button (and revoke-all).

## 10. Settings

- Rebuild the Settings page into a clean sectioned layout where every control actually works in-session: profile/account preferences, notification toggles, appearance/density, and the existing Backup & Restore panel.

## Technical notes

- New shared client state for announcements and notifications (a small context under `src/components/portal/`), consumed by `PortalShell` and the three dashboards.
- `PortalShell.tsx` gains the profile dropdown and notification popover (shadcn `DropdownMenu`, `Popover`, `Dialog`); `src/lib/nav.ts` reorders the profile entry into a bottom group.
- Module edits are contained to `ApplicantManagement.tsx`, `RecruitmentManagement.tsx`, `NewHireOnboarding.tsx`, `CoreHCM.tsx`, `EmployeeRecords.tsx`, `AdminModules.tsx` (User Management + Settings), and `ProfilePage.tsx`.
- Permission matrix editing keeps `roleGroupMatrix` in `src/data/users.ts` as the seed and holds edits in component state.
- Onboarding promotion is derived from checklist completion in component state; no data-model change needed.
