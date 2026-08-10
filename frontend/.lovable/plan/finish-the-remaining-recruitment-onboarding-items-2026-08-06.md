# Finish the remaining recruitment/onboarding items

I checked the code against your list. Most of the New Hire Onboarding items are already in place; the remaining gaps are in Applicant Management and Recruitment Management.

## Already done (verified in code)

New Hire Onboarding:
- Table rows are not clickable (actions only).
- Edit Checklist / Save / Cancel: cancel restores the snapshot and returns the button to "Edit Checklist"; closing the card via X exits edit mode too.
- "Advance stage" button only appears at 100% completion; ticking all items no longer auto-promotes.
- Checklist edit mode has a Save button.
- Probationary hires get "Hire & create account".

Applicant Management:
- Candidate ranking legend/labels already removed, chart on the left with the count column beside it.
- Applicant list actions are a dropdown (View/Review, Accept & schedule, Refer to other job, Reject) plus a stage filter.
- Assessment Accept/Reject show a confirmation dialog first, and the row is removed from the list after the decision; accepted applicants land in New Hire Onboarding as Pre-onboarding only (no account created).
- Add Applicant: Department then Position, "Retry analysis", and autofill of name/email/phone/address from the screening.

## Still to build

1. Donut chart percentages — put the percentage back on the candidate-ranking donut (slice percentage labels plus a total in the centre), keeping the chart left and the count column right.
2. Interview Scheduling customization
   - Editable slot settings panel: number of applicants accepted per time slot, the list of time slots per day, and a "walk-in allowed" toggle.
   - Defaults: 14 applicants per slot, 14 time slots, Interview Details mode = On-site.
   - Slot pickers show remaining capacity and block booking when a slot is full.
3. Cancel interview confirmation — clicking Cancel in the interview row opens a confirmation modal; only on confirm is the interview removed from the list and logged in the audit trail.
4. History & Audit — remove the "Showing 1-10 of N" counter line from that table (keep page controls).
5. Interview assessment downloads — add buttons to download the evaluation form and the applicant's resume screening result from the assessment dialog/rows.
6. Recruitment: job post entry card — the Job Post Builder tab opens on a dashed-border "Create a job posting" card. Clicking it opens a modal to pick Department and Job Position, then seeds the builder.
7. Recruitment: clickable navigation trail — trail like `Create a job / Department / Position / Builder`. Clicking the position step reopens the department+position picker; clicking "Create a job" returns to the dashed card.
8. Recruitment: Save draft actually saves — persists the current builder content as a Draft posting in the postings list (updating the same draft on repeat saves) instead of only showing a toast.

## Technical notes

- `src/components/modules/ApplicantManagement.tsx`: add `label`/centre-label to the Recharts `Pie`; replace the hardcoded `suggestedSlots` with state-driven slot settings (capacity, times, walk-in) with the stated defaults; add a cancel-confirmation `Dialog`; pass a flag to `TablePagination` (or render page buttons directly) to hide the range text for the history table; generate downloads client-side as text/CSV blobs.
- `src/components/modules/RecruitmentManagement.tsx`: add a builder gate step (`picker` -> `editing`) with the dashed card, extend the existing department dialog with a position select, add a clickable trail component, and make `saveDraftAction` write a `status: "Draft"`, `active: false` job into `jobList` keyed by a draft id.
- All presentation-layer changes; no backend or schema work.
