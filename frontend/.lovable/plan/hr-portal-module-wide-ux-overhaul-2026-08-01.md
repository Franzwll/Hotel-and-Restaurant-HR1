# HR Portal: Module-Wide UX Overhaul

A large batch of changes across 9 areas. All work is frontend/presentation on the existing demo data — cream/beige/white/burgundy palette and current design tokens preserved throughout. Delivered in phases so you can review as it lands.

## Phase 1 — Applicant Management

- Move **Top Candidates** to the right of Candidate Ranking as a vertical stacked panel (ranking becomes a two-column layout, stacking on mobile).
- Replace the header **Add Applicant** with a **Reports** button (dropdown: All Applicants, By Position, By Status, Screening Summary — generates a printable/downloadable summary from current data).
- Move **Add Applicant** into the Applicant List card toolbar, last in the row: Search → Position filter → Status filter → Add Applicant.
- In the screening **Review** panel, add a document preview pane on the left showing the applicant's uploaded resume file (inline viewer with filename, page frame, and download/open action; graceful fallback when no file exists).
- Convert **Screening Setup** from a tab/section into a modal, opened by an options (gear/ellipsis) icon button; existing setup content moves inside unchanged.

## Phase 2 — Interview Scheduling redesign

- Calendar expands to fill its container; each date shows an interview **count badge**; legend retained.
- Selected day's interviews render as appointment cards: time, applicant, position, interviewer, mode badge, and quick actions (View, Reschedule, Cancel).
- **Book an Interview** becomes an explicit stepper: 1 Applicant → 2 Date → 3 Time → 4 Details → 5 Confirm, using pill selectors, consistent spacing, rounded cards, and a summary block before confirm.
- **Scheduled Interviews** table gets search, status/mode filters, status badges, and actions consolidated into a row menu. Responsive and keyboard/screen-reader accessible.

## Phase 3 — Recruitment Management

- Add a **source/breadcrumb indicator label** between "Vacancies & Postings" and Add Component, e.g. `Create job post > Front Office > Front Desk Receptionist`.
- Add **list view** for job posts alongside grid, with a view-toggle icon group (list / grid).
- Surface **justification notes** from Core HCM requisitions: shown on the requisition item in "Requests from Core HCM", and inside the Job Post Builder only when the post originates from a requested vacancy.
- Requested vacancies persist until posted — they are no longer removed/consumed when a draft is abandoned.
- Move **New Job Post** to the far right of the toolbar row: Search posted positions → Status filter → Department filter → (right edge) New Job Post.

## Phase 4 — New Hire Onboarding

- Checklist becomes driven by the selected employee's status: switching status lists auto-selects the first employee in that list and swaps the checklist accordingly (Pre-Onboarding → Probationary → etc.).

## Phase 5 — Core HCM

- Merge **Departments** and **Job Positions** into one two-card horizontal layout (like Onboarding's list + checklist): left card = departments, right card = positions of the selected department. Each position row is collapsible and reveals the employees in that position.
- **Create Department** button placed beside **Create Job Position**.
- Two filters: department filter (all / specific) and position filter (all / specific), plus a search bar covering departments, positions, and employees.

## Phase 6 — Employee Records

- New **Record History / Logs** tab tracking add, edit, and delete actions (who, what, when, file) — populated from a demo activity log and appended to as actions occur in-session.
- Remove the **On Leave** status everywhere it appears (filters, badges, counts).
- Fix **Bulk Generate** so generated documents are visibly listed with per-document status and download actions.
- Move **Add Employee** to the right of **Bulk Generate**.

## Phase 7 — ESS Management

- Remove **Employee Monitoring** and the **Requests by category** panel.
- Employee Requests: add a **search bar** (employee or request) plus **status** dropdown filter and a **request-category** dropdown filter.
- **Create on Behalf** restyled as a primary red/burgundy action button, positioned to the right of **Bulk Reject**.

## Phase 8 — User Management

- Move **Create User** to the top-right of the System Users card, above the Actions column area.
- **Permission Matrix** reworked to be role-based and compact: roles as columns, grouped permission categories as rows, simple allow/deny marks — no dense per-user grid.
- Rename status **Locked → Suspended** (label, badge, filters, actions).
- Add search + role/status filtering to the user list.
- In Create User, hide the **Department** field when role = Super Admin.
- **Active Sessions** in Authentication & Login Security made clear and interactive: device, location, IP, last active, current-session marker, with working "Revoke" and "Revoke all others".

## Phase 9 — Audit Logs, Settings, Profile

- System Activity table: add **Department** and **Device** columns (with matching filters where they exist).
- Move **Generate Reports** to the page header, top-right.
- Settings: remove the **Security** section (now covered by User Management).
- Settings: keep **Backup & Restore** (it belongs in Settings) and make it functional/interactive — backup list with timestamps and sizes, Create backup with progress, Download, Restore with confirmation dialog, and schedule toggle.
- **Profile** page rebuilt to match the supplied reference: left card with avatar, name, position, Change Photo button and file-type hint; right column with Personal Information and Account Information field grids, status badge, and an Edit Profile action that toggles fields between read-only and editable.

## Technical notes

- Work stays in `src/components/modules/*` (`ApplicantManagement`, `RecruitmentManagement`, `NewHireOnboarding`, `CoreHCM`, `EmployeeRecords`, `EssManagement`, `AdminModules` for User Management / Audit Logs / Settings, `ProfilePage`) with demo data in `src/data/*` extended where new fields are needed (justification notes, record logs, sessions, devices/departments on audit entries, resume file metadata).
- Oversized files (`ApplicantManagement.tsx` at ~2.2k lines, `RecruitmentManagement.tsx` at ~1.2k) get split into focused child components as their sections are touched — Interview Scheduling, Screening Setup modal, Ranking/Top Candidates, and the job post list/grid views become separate files.
- Reused shadcn primitives: `Dialog` (Screening Setup, Restore confirm), `Collapsible` (position → members), `Tabs`, `DropdownMenu` (row actions, Reports), `ToggleGroup` (list/grid), `Table`, `Badge`.
- Everything remains client-side against the existing seed data; no backend is introduced in this plan.
