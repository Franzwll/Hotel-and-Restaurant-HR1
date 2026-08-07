# UI refinements: Applicants, Recruitment, Onboarding, Login

Frontend-only changes; demo state and the cream/beige/burgundy palette stay as they are.

## 1. Applicant Management

**Candidate Ranking card**
- Center the donut chart and the indicator box (Perfect for the Job, Fit for other Job, Invalid credential, Not fitted to Job with their counts) as one centered cluster inside the card, instead of the current stretched two-column split. Chart keeps its percentage labels and center total.

**Interview Scheduling — time slots**
- Replace the long wall of time-slot pills with a fixed-height, internally scrolling slot area so changing the slot count never stretches the page.
- Move all Slot settings (applicants per slot, number of slots, start time, interval, walk-in allowed, default mode) out of the card into a modal, opened by a "Slot settings" button. Defaults stay 14 applicants / 14 slots / On-site.

**Assessment decisions**
- Accept and Reject only move the applicant into New Hire Onboarding as pre-onboarding — no portal account is created at that point. The account is only created later, from onboarding, once the hire reaches Probationary (existing "Hire & create account" button). Confirmation dialogs and list removal behaviour stay.

## 2. Recruitment Management

- Opening the Job Post Builder tab always starts on the dashed-border "Create a job posting" card (fresh state each time the tab is entered).
- Clicking that card opens a modal containing only two choosers — Department and Job position — plus a continue action. No other job fields in that modal.

## 3. New Hire Onboarding

- In the employee checklist card, move the "Advance to <stage>" button below the Mark all done / Save / Cancel (and Edit Checklist) row, as a full-width action at the bottom of the card. Reveal condition (100% complete) and manual-click behaviour unchanged.

## 4. Login page

- Simplify the left panel: keep the logo, one short headline and a single supporting line with the client's key info (property name, role-based access note, front-desk contact). Remove the brigade grid, the long paragraph and extra badges.
- Use the uploaded Oxford Suites tower exterior photo as the panel background (portrait shot fits the tall panel), with a burgundy/dark overlay and a gold accent rule so text stays legible and the panel reads as an eye-catching hotel hero.
- Right-hand credential panel (role tabs, email/password, sign-in) stays functionally unchanged.

## Technical notes

- `ApplicantManagement.tsx`: ranking grid becomes a centered flex cluster; slot list wrapped in a scroll container with `max-h`; slot settings fields moved into a `Dialog`; verify accept/reject paths only call `hireStore.setPending` (no account creation).
- `RecruitmentManagement.tsx`: reset `builderStarted` when the builder tab is activated; split the shared dialog so the card-triggered one renders only department + position selects.
- `NewHireOnboarding.tsx`: reorder the action row so the advance button renders in its own row after the edit/save/cancel group.
- `login.tsx`: trim copy, swap hero image to a new asset created from the uploaded photo via the asset CLI.
