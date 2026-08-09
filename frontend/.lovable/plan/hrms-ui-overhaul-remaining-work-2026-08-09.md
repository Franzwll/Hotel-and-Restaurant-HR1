# HRMS UI Overhaul — Remaining Work

Already done: persistent (inert) pagination footers, placeholder-based empty-state labels, fixed list card heights, red/gold tab styling, Recruitment requisition alignment + clickable metric cards, and the full New Hire Onboarding rework (Regular removed, Awaiting Evaluation metric, gated Advance button, Request for evaluation waiting state, Requested Checklists section).

## 1. Finish list/table consistency pass

Apply the shared list treatment to every remaining list: Applicant List, Scheduled Interviews, Assessments, History & Audit, Record History, Employee Requests, ESS Activity Log, Employee List.

- Fixed-height list body so the card never shrinks when 1-9 rows (or zero) match.
- Pagination footer always visible; buttons disabled when there is only one page.
- Empty state text derived from that list's own search placeholder ("No applicants match your search", "No departments match your search", etc.).

## 2. Applicant Management

- Total Applicants, Passed Screening, Ready to Assess become clickable — each jumps to the applicant list with the matching filter applied.
- Section tabs already use red active / gold hover; verify across all four tabs.
- Add Applicant modal: move full name, email, contact number, phone and address out of step 3 into step 2, grouped with the resume/photo upload. Step 3 shows the screening result rendered exactly like the Resume Screening Result block in Review, keeping the Retry analysis action.
- Interview Calendar: remove "Choose date"; move the Slot Settings button under the Today / Prev / Next row; delete the "14 slots · 14 applicants each · 30 min · walk-in allowed" summary line.
- "Interviews on <date>" header gains a search box and a status dropdown on its right, inside the existing card width.
- Book an Interview: remove "Choose date", convert time-slot picking to a dropdown, remove walk-in.
- Slot Settings modal rebuilt per the reference: two columns — left with Capacity (interviewers, rooms, max concurrent callout), Time Configuration (first slot, duration, number of slots), Break Slot toggle with start/end + quick presets, Other Options; right with Daily Schedule Preview listing every generated slot (break row highlighted) and a Summary checklist. Footer: Reset to default / Save settings.

## 3. Recruitment — Job Post Builder

- Remove the standalone Request Note button; the preview card becomes two stacked sections: Requested Note (same content as the view-note modal) and Preview.
- Rebuild each platform preview to match the references:
  - Website: serif headline, meta line, salary in red, Job Description / Responsibilities / Qualifications with check bullets, Benefits chips.
  - Indeed: card header with company link, Apply with Indeed button, Job details pay/type chips, Location, Full job description sections.
  - Facebook and Instagram: real post chrome (avatar, handle, date, action row) plus the hiring poster.
- The hiring poster uses the provided template artwork with the position title overlaid, driven by the position currently set in the builder.

## 4. Employee Records

- Icons on Regular and Probationary metric cards, made clickable, equal size and height-aligned with the others.
- "View 201 File" renamed to "View Records" with an icon.
- Inside View Records, merge Edit Personal Data and Edit Employment into one edit flow (single edit toggle covering both sections, one Save), and add a record report/print action.

## 5. ESS Management

- Icons on Pending, Under Review, Approved, Completed metric cards.
- Confirm red active / gold hover on Request Queue, ESS Administration, Audit & Compliance.
- Add ESS category creation: a manage-categories dialog under ESS Administration to add categories (name, description, approver) that then appear wherever request categories are listed.

## 6. Settings

Rebuild as a responsive 3-per-row card grid matching the reference: Notifications (toggles + Manage link), Preferences (theme, language, date/time format, timezone rows), Login Security (2FA, password policy, session timeout, max attempts), Company (company info rows), Backup & Restore (wide card: automatic-backup banner, backup table with download/restore actions, "Showing 1-4 of 4"). Each card has a red footer link with arrow.

## 7. Profile

Rebuild to imitate the reference: left sidebar card with maroon gradient header, large avatar with camera badge, name, role, Active badge, Change Photo button, format hint, then Employee ID / Department / Date Created / Last Login rows with icons. Right side: Profile Information and Account Details tabs, inner card with Personal Details and Account Details field grids, Edit Profile button bottom-right.

## Technical notes

- Reuse the existing shared pieces: `TablePagination`, `ListEmptyState`, the `list-body` utility, and `StatCard` (icon + onClick).
- The hiring poster template is registered as a CDN asset pointer and imported; the position text is rendered as an overlay so it follows the builder value.
- All colors come from existing semantic tokens (primary red, gold) — no hardcoded hex in components.
- Given the size, work lands module by module with a typecheck after each: Applicant Management, Recruitment previews, Employee Records, ESS, Settings, Profile.