# Onboarding, Applicant, Recruitment fixes + brand logo

All work is frontend/demo-state only, staying in the existing cream / white / burgundy palette.

## 1. New Hire Onboarding

- Table rows are no longer clickable; selecting a hire happens through an explicit action in the Actions column (the checklist card opens from there).
- Edit-mode state is properly reset: closing the checklist card with the X, or leaving edit mode any other way, returns the Actions button and the card button from "Cancel" back to "Edit Checklist".
- Checklist editing gets an explicit **Save** button next to Cancel; changes commit on Save and roll back on Cancel.
- Checking every item no longer auto-promotes the hire. The stage only changes when the user presses **Advance stage**.
- The **Advance to …** button only appears once the checklist is 100% complete (and the hire is not yet Regular).
- A hire in **Probationary** can be hired / have their portal account created from the checklist card (account creation action with the default password note), rather than that happening earlier.

## 2. Applicant Management

**Candidate Ranking**
- Remove the pie labels/legend list under the chart; the donut moves to the left column of a two-column layout, with the ranking content beside it.

**Applicant List**
- Actions column keeps only **Review**; accept, reject and "refer to another job" live inside the Review dialog (adding the refer-to-other-position action there).
- Add a **Stage** dropdown filter to the list toolbar.

**Assessment section**
- Accept shows a confirmation dialog first ("Send to New Hire Onboarding?"); on confirm the applicant is handed over as Pre-onboarding and the row is removed from the assessment list.
- Cancel/decline also opens a confirmation modal and removes the row on confirm.
- Accept/decline never creates an employee account by itself — the applicant only enters Pre-onboarding.
- Interview assessment gains **Download evaluation form** and **Download screening result** actions.

**Add Applicant**
- Field order becomes Department → Position (position options filtered by the chosen department).
- Screening result panel gets a **Retry analysis** action.
- After analysis, full name, email, phone and address are auto-filled from the parsed resume.

**Interview Calendar / Scheduling**
- Slot configuration becomes editable: number of applicants per slot, the time slots themselves, and a walk-in toggle.
- Defaults: 14 applicant slots, 14 time slots, interview mode **On-site**.

**History & Audit**
- Remove the duplicate "Showing 1–10 of …" line (keep a single pagination control).

## 3. Recruitment Management

- Job Post Builder opens on an empty-state card with a dashed border reading **Create a job posting**. Clicking it opens a modal to pick department and job position, which then seeds the builder.
- The builder's navigation trail becomes clickable: clicking the position step reopens the department/position chooser; clicking the "Create a job" step returns to the dashed empty-state card.
- **Save draft** actually persists: the draft is stored in the postings list with `Draft` status (and can be reopened for editing) instead of only updating an in-memory snapshot and showing a toast.

## 4. Brand logo

- Add both uploaded marks as assets: the maroon "O" for light surfaces (landing page, login light panel, public shell) and the white "O" for dark surfaces (sidebar, login hero panel).
- `Logo` renders the correct mark based on `tone`, placed to the left of the existing "Oxford Suites Makati" wordmark, which stays exactly as it is.
- Also set the app favicon from the maroon mark.

## Technical notes

- Onboarding: drop the auto-promote branch in `toggleItem`; add `saveEditChecklist` wiring plus a Save button; clear `editingId`/`editSnapshot` when the panel closes; gate the advance button on `progress === 100`.
- Applicant Management: new `stageFilter` state for the list; move accept/reject/refer into the review dialog footer; confirmation dialogs reuse the existing `Dialog` primitives; slot config held in local state (`slotsPerTime`, `timeSlots`, `walkIn`) with the stated defaults; downloads generate a text/CSV blob client-side.
- Recruitment: add a `builderStarted` step state driving empty-state vs builder, a clickable trail, and make `saveDraftAction` push/update a `Draft`-status job in `jobList`.
- Logo: `lovable-assets create` pointers for both uploads; `public/favicon.png` written as a real square file and referenced from `__root.tsx`.
