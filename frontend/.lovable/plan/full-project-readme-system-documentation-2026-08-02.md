# Full project README / system documentation

Replace the default Lovable starter `README.md` (currently 30 lines of boilerplate) with a complete description of the Oxford Suites Makati HRMS: what it is, who uses it, every module, every route, the data model, and the current limitations.

## What the README will contain

**1. Overview**
Web-based Human Resource Management System for Oxford Suites Makati (hotel property). A public careers site plus three role-based internal portals. Currently a fully interactive front-end prototype — all data comes from in-memory fixtures, nothing persists on refresh.

**2. Tech stack**
React 19, TanStack Start + TanStack Router (file-based routing), TanStack Query, Vite 8, TypeScript, Tailwind CSS v4 (tokens in `src/styles.css`), shadcn/ui on Radix primitives, Recharts, lucide-react, sonner, react-hook-form + zod, date-fns. Scripts: `dev`, `build`, `build:dev`, `preview`, `lint`, `format`.

**3. Roles and demo accounts**
| Role | Demo user | Base path |
| --- | --- | --- |
| Super Admin | Bullseur Santiago | `/superadmin` |
| Admin | Juan Dela Cruz | `/admin` |
| Employee | Kevin Dela Cruz | `/employee` |
Role access differences are defined in `src/lib/nav.ts`; Admin sees everything Super Admin does except User Management and Audit Logs; Employee sees only Dashboard, ESS, Onboarding, Profile, Settings.

**4. Site map** — full route table for the public site (Home, About, FAQ, Contact, Jobs list, Job detail, Login) and all portal routes for each of the three roles.

**5. Module reference** — one section per module describing purpose, tabs, and key interactions:
- Applicant Management (Ranking & Applicants, Interview Scheduling with the redesigned calendar + booking wizard, Assessment)
- Recruitment Management (Vacancies & Postings, Job Post Builder, Requisitions)
- New Hire Onboarding (Pre-onboarding → Probationary → Regular, checklist resets to 0% on promotion)
- Core HCM (departments, org chart, positions with collapsible member rows and per-member Transfer)
- Employee Records (Employee List, Record History, 201 file with Personal/Documents/Employment History)
- ESS Management (Request Queue, ESS Administration, Audit & Compliance) and Employee ESS (Attendance, Schedule, Leave, Payroll, Benefits, Requests)
- User Management (User List, Permission Matrix, Authentication & Login Security)
- Audit Logs, Settings (Notifications, Preferences, Company, Backup & Restore)
- Announcements (audience targeting All/Employee/Admin/Super Admin, header megaphone panel, Super Admin–only delete)

**6. Data model** — table of each fixture file and the types it exports: `hr.ts` (Department, Position, OrgNode, NewHire, Employee), `applicants.ts` (Applicant, Interview, screening/assessment criteria, interviewers), `jobs.ts` (Job, `getJob`, peso formatter), `users.ts` (SystemUser, permission matrix/groups, AuditEntry), `ess.ts` (ESSRequest, profile, attendance, schedule, leave, payroll, benefits), `requisitions.ts` (Requisition + subscribable store), `company.ts` (company info, facilities, modules, announcements, FAQs). Plus the shared runtime store `src/components/portal/portal-state.tsx` (announcements + notifications pub/sub).

**7. Project structure** — annotated directory tree of `src/`.

**8. Design system** — burgundy / cream / beige / white palette, display + body font pairing, semantic tokens in `src/styles.css`, shadcn variants; rule against hardcoded color utilities.

**9. Current limitations & next steps** — no backend, no real authentication (login is cosmetic), no persistence, no file uploads, no email; recommended next step is Lovable Cloud for accounts, roles, and persisted HR data.

## Technical notes

Single file changed: `README.md` (full rewrite). No source or behavior changes. Route and module names will be taken verbatim from `src/routes/`, `src/lib/nav.ts`, and the module tab definitions so the document stays accurate.
