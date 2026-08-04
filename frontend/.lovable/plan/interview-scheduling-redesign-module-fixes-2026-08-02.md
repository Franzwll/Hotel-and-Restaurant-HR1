# Interview Scheduling Redesign + Module Fixes

All work is frontend-only, local demo state, and stays in the cream / beige / white / burgundy palette.

## 1. Applicant Management — Interview Scheduling redesign

Rebuild the two cards to match the reference layout (side by side on desktop, stacked on mobile), using rounded white cards, soft borders, subtle shadows and generous spacing.

**Interview Calendar (left)**
- Card header: red icon tile, "Interview Calendar" title, short description, and Today / Previous / Next controls on the right.
- Month label ("August 2026") above a full-bleed calendar grid with visible cell gridlines and SUN–SAT headings.
- Date states: selected (solid burgundy), booked (tinted with a red dot), suggested free day (gold dot + ring), unavailable/out-of-month (muted).
- Count badge on dates that have more than one interview.
- Legend under the grid: Booked · Suggested free day · No availability.
- Below the legend, the day's interviews as compact rows: time pill, applicant name, position, interviewer, and a chevron quick action. Updates as the selected date changes.

**Book an Interview (right)**
- Replace the pill step wizard with a single scrollable numbered form: 1. Select Applicant (dropdown), 2. Choose Date (suggested-date pills with slot counts), 3. Select Time Slot (pill buttons), 4. Interview Details (mode + interviewer dropdowns side by side).
- Info panel below showing on-site location or the virtual meeting link, based on the chosen mode.
- Full-width burgundy "Confirm & Send Invitation" button.
- Booking behaviour, validation and the Scheduled Interviews table below stay as they are.

## 2. Applicant Management — Ranking row heights

Make the Top 5 Candidates Today card match the Candidate Ranking card's height instead of overflowing: equalize the grid row and let the candidate list scroll inside the card.

## 3. New Hire Onboarding — checklist resets on promotion

When a hire's checklist reaches 100% and they auto-promote to the next stage, they arrive with a fresh checklist for that stage, all items unchecked (0% complete). Manual "advance stage" does the same.

## 4. Core HCM

- The first department is selected by default instead of "All departments".
- Remove the **View roster** action from department cards (and the roster dialog it opened).
- Move transfers into the position cards: expanding a position shows a **Members** list, one row per employee — `Name | Employee ID | Department | Position | Status | Transfer` — with the Transfer button opening the existing transfer dialog.

## 5. Announcements

- The audience picker offers **All**, **Employees**, **Admins**, and **Super Admins**; posting targets the matching portals.
- Announcements surface in the top header of every portal via a megaphone button with an unread count and a dropdown panel listing them.
- Only Super Admin sees the remove action on an announcement; admins and employees can read only.

## Technical notes

- Scheduling redesign is a custom month grid inside `ApplicantManagement.tsx` (replacing the `Calendar` component usage there) so date states, badges and navigation match the reference exactly.
- Onboarding stage checklists come from a per-stage default list in `NewHireOnboarding.tsx`; promotion swaps in the new list with `done: false`.
- `CoreHCM.tsx`: drop `rosterDept` state and its dialog; render the member rows inside the open position card; keep the existing transfer dialog.
- `portal-state.tsx` widens `Announcement["audience"]` to include Super Admins and adds role-based filtering; `PortalShell.tsx` gains the header announcements dropdown; `AnnouncementDialog.tsx` and `AnnouncementsCard.tsx` follow the new audience list and superadmin-only delete.
