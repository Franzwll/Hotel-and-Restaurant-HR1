# Login polish, interview UI rework, recruitment & onboarding fixes

Frontend/presentation work only. Cream/beige/burgundy palette and demo data stay as they are.

## 1. Login page

- Rebuild the left panel as a proper hotel hero: full-bleed photo, layered burgundy scrim + soft vignette, gold accent rule, and a tightened content stack (logo, headline, one supporting line, contact/role footer). Content anchored bottom-left with generous, viewport-scaled padding instead of the current centered block.
- Make the photo genuinely adaptable: `object-cover` with a focal point that holds up at both wide and tall panel ratios, plus an `aspect`-safe container so no letterboxing or awkward crop appears between 1024px and ultrawide.
- Pick the image that reads best in a tall panel from the available set (`oxford-tower-wide.png`, `oxford-suite-makati-interior1/2/3.png`) — evaluate each in the browser at desktop and short-viewport sizes and keep the strongest one.
- Right panel: refine typography rhythm, role tab styling and button/field spacing so the form reads as a professional enterprise sign-in. Functionality (role tabs, demo credentials, validation, OTP redirect) unchanged.

## 2. Applicant Management — Interview Scheduling

Match the uploaded reference layout:

- **Interview Calendar card**: header with icon + title on the left, `Today` / `‹` / `›` and a **gear icon button** (tooltip "Slot settings") on the right — the settings summary strip and text button move out of the Book card into this gear. Two-column body: month grid on the left, a right column titled "Interviews on <date>" with a count badge, a `View all` action, and per-interview rows (time pill, applicant + position, interviewer + mode, chevron). Legend row stays at the bottom.
- Fill the vertical space: internal padding and section spacing increase so the card body reaches the bottom edge without changing the card's overall height, and the interview list column scrolls internally when long.
- Both cards get equal height at all breakpoints (stretch alignment on the grid, `h-full` on each card) so Calendar and Book an Interview always end on the same line.
- **Book an Interview**: numbered stepper (1 Applicant, 2 Date, 3 Time Slot, 4 Details) with circled numbers and connecting rule replacing the four progress bars; numbered section labels; horizontal date chips with "(N open)" counts and a next arrow; slot select with "N slots available · N applicants per slot" helper; Interview Type + Interviewer side by side; full-width burgundy "Confirm & Send Invitation".
- **Slot Settings modal** (opened by the gear): two-column — left has Capacity (applicants per slot, number of slots), Time Configuration (first slot starts, slot duration), Break Slots block with toggle + start/end + quick-set chips (Lunch Break / 15 min / 30 min / 1 hour), Other Options (walk-in toggle, default interview type); right shows a live Schedule Preview list of generated slots with Available/Break markers and a summary checklist. Footer: Reset to default / Save Settings. Break slots are excluded from bookable slots.

## 3. Applicant Management — accept moves candidate to onboarding

Accepting after assessment must actually place the applicant in New Hire Onboarding as Pre-onboarding, not only toast. The handoff code exists; whether the record lands is unverified, so step one is to reproduce accept → onboarding in the browser and confirm exactly one Pre-onboarding row appears and is selected. Then fix whatever breaks the handoff (intake guard, id collision, or the navigation timing) and keep it idempotent.

## 4. Recruitment Management

- **Job Post Builder empty state**: enlarge the "Create a job posting" card (taller, wider inner content, stronger hover/press feedback, clearer supporting copy) and swap the plain plus icon for a document/job-post icon (`FilePlus2`) in a filled rounded tile.
- **Vacancy Requisitions list**: restructure each row for scanability — position + department as the primary line, `New` and status badges grouped, and openings / urgency / requested-date as labelled chips instead of a run-on sentence. Urgency gets a colour-coded badge.
- The always-visible justification paragraph is replaced by a compact **"View note"** button per requisition that opens the justification in a popover/dialog (requester, date, urgency, justification text), so long notes no longer bloat the list.
- In the builder, the "Justification from Core HCM (REQ-…)" card under the navigation trail is replaced by the same **note button** placed in the trail row — one click reveals the note, keeping the trail area compact and non-repetitive.

## 5. New Hire Onboarding

- Remove the "Portal account created — default password Oxford@2026" note and the "Hire & create account" button from the Probationary checklist card.
- Account creation now happens only through the auto-opened **Add New Hire** modal:
  - Clicking **Advance** on a Pre-onboarding hire opens that modal pre-filled with the hire (name locked).
  - Saving it creates the account and moves the hire to Probationary.
  - Closing/cancelling the modal leaves the hire in Pre-onboarding — the stage change is applied on save, not before — and they can retry via Advance.
  - The regular **Add New Hire** button keeps its current behaviour: empty modal, hire filed as Pre-onboarding.
- **Onboarding Status Tracker**: the connecting line becomes purely decorative (`pointer-events-none`, no pointer cursor, not focusable). Only the numbered circles stay clickable — each gets hover/focus highlight (ring + colour shift) on the circle itself, with existing stage-select behaviour and the label/blurb intact.

## Technical notes

- `login.tsx`: restructure panel layers, swap hero import, verify chosen photo in the browser at 1440x900 and 1280x700.
- `ApplicantManagement.tsx`: scheduling grid → `items-stretch` + `h-full` cards; calendar body → `grid xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]` with scrollable interview column; stepper component replaces the 4-bar progress block; slot settings dialog moves to a gear trigger in the calendar header and gains break-slot state + preview; break slots filtered out of `buildTimeSlots` consumers.
- `hires.ts` / `NewHireOnboarding.tsx`: verify `setPending` → `consumePending` intake; move the probationary stage transition into the modal's save handler; strip the account note/button; tracker line `pointer-events-none`, circles get `focus-visible` + hover ring.
- `RecruitmentManagement.tsx`: empty-state card sizing + `FilePlus2`; requisition row restructure with a note popover; replace the builder justification card with a note button in the trail row.
