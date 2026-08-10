# HRMS UI Overhaul — Remaining Modules

Already landed in earlier passes: persistent (inert) pagination footers, placeholder-derived empty states with fixed list heights, red/gold section tabs, Recruitment requisition alignment + clickable metric cards, the New Hire Onboarding rework (Regular removed, Awaiting Evaluation metric, gated Advance, Request for evaluation waiting state, Requested Checklists), and the Settings + Profile rebuilds.

## 1. Applicant Management

- Total Applicants, Passed Screening, Ready to Assess become clickable and jump to the applicant list with the matching filter applied.
- Add Applicant modal: move full name, email, contact number, phone and address from step 3 into step 2, grouped with resume/photo upload. Step 3 shows the screening result rendered like the Resume Screening Result block in Review, keeping Retry analysis.
- Interview Calendar: remove "Choose date"; move Slot Settings under the Today / Prev / Next row; delete the "14 slots · 14 applicants each · 30 min · walk-in allowed" summary line.
- "Interviews on <date>" header gains a search box and status dropdown on the right, inside the existing card width.
- Book an Interview: remove "Choose date", time-slot selection becomes a dropdown, remove walk-in.
- Slot Settings modal rebuilt to the reference: left column Capacity (interviewers, rooms, max-concurrent callout), Time Configuration (first slot, duration, number of slots), Break Slot toggle with start/end + quick presets, Other Options; right column Daily Schedule Preview (every generated slot, break row highlighted) and Summary checklist. Footer: Reset to default / Save settings.

## 2. Recruitment — Job Post Builder

- Remove the standalone Request Note button; the preview card becomes two stacked sections: Requested Note (same content as the view-note modal) and Preview.
- Rebuild each platform preview per the references:
  - Website: serif headline, meta line, salary in red, Job Description / Responsibilities / Qualifications with check bullets, Benefits chips.
  - Indeed: card header with company link, Apply with Indeed button, Job details pay/type chips, Location, Full job description sections.
  - Facebook and Instagram: real post chrome (avatar, handle, date, action row) plus the hiring poster.
- The hiring poster uses the provided Template artwork, registered as a CDN asset pointer, with the position title overlaid so it follows the position set in the builder.

## 3. Employee Records

- Icons on Regular and Probationary metric cards, clickable, equal size and height-aligned with the others.
- "View 201 file" renamed to "View Records" with an icon.
- Inside View Records, merge Edit Personal Data and Edit Employment into one edit flow (single edit toggle across both sections, one Save) and add a record report/print action.

## 4. ESS Management

- Icons on Pending, Under Review, Approved, Completed metric cards (verify all four).
- Confirm red active / gold hover on Request Queue, ESS Administration, Audit & Compliance.
- Add ESS category creation: a manage-categories dialog under ESS Administration to add categories (name, description, approver) that then appear wherever request categories are listed.

## Technical notes

- Reuse the shared pieces already in place: `TablePagination`, `ListEmptyState`, the `list-body` utility, and `StatCard` (icon + onClick).
- All colors from existing semantic tokens (primary red, gold) — no hardcoded hex in components.
- Poster artwork lands as a CDN asset pointer in `src/assets` and is imported; position text is an overlay, not baked into the image.
- Work lands module by module with a typecheck after each: Applicant Management, Recruitment previews, Employee Records, ESS.