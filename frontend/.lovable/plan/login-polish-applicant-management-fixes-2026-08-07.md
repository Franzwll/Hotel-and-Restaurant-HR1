# Login polish + Applicant Management fixes

## 1. Login — enhanced, fully responsive left panel

Keep the existing Oxford tower photo, but make it never crop and never look stretched:

- The photo is fitted inside the panel (contain) so the whole tower is visible at any window size or aspect ratio, with a brand-tinted backdrop filling the leftover space.
- Add a soft vignette/gradient scrim only where text sits, so the headline and footer stay readable without washing out the image.
- Refine the panel composition: gold hairline accent, tighter type scale for the "Oxford Suites Makati" headline, and a small trust strip (role-based access, contact line) anchored to the bottom.
- Fluid sizing: padding, headline size, and the panel/form column split adapt across laptop, wide, and ultrawide screens instead of a fixed ratio. Panel stays hidden on mobile as it is today.
- Serve the image with a responsive width hint so it stays crisp on high-DPI screens.

## 2. Candidate Ranking — side-by-side layout

Inside the Candidate Ranking card, put the donut chart and the status legend/count tiles into two columns (chart left, tiles right), centered as a group within the card. Card width is unchanged. On narrow screens they stack back to the current vertical arrangement.

## 3. Interview Scheduling

**Book an Interview** — make the form feel interactive as it is filled in:
- Numbered steps light up as each one is completed, with a progress indicator.
- Selected applicant shows a small summary chip (name, position, score) once picked.
- Date and time-slot choices show live remaining capacity and disable full slots.
- The submit button stays disabled with an inline hint until every required field is set, and validation appears next to the offending field.

**Interview Calendar** — "Interviews on <date>" list gets a fixed maximum height with its own scroll area, so the card size stays identical whether one or twenty applicants are booked that day. Each row keeps its current compact layout; a count badge and a scroll affordance indicate more entries below.

## 4. Assessment accept flow

Accepting a candidate no longer opens the Add New Hire dialog. Instead the accepted applicant is written straight into New Hire Onboarding as a Pre-onboarding record (with their position, department, email, phone, start date, and the standard checklist), and you land on the Onboarding page with that record selected. The Add New Hire form now only appears when a hire is advanced to Probationary, so their probationary details can be confirmed.

## Technical notes

- `src/routes/login.tsx`: restructure the left panel container; `object-contain` image on a tinted background layer, fluid `clamp()`-based spacing, responsive grid template columns.
- `src/components/modules/ApplicantManagement.tsx`: ranking block becomes `grid place-items-center gap-6 md:grid-cols-[auto_auto] md:justify-center`; interview list wrapped in a `max-h-[…] overflow-y-auto` scroll container; booking form gains derived step-completion state and disabled submit.
- Accept path: replace `hireStore.setPending(...)` semantics with a direct "create hire" action so no modal opens; move the pre-filled dialog trigger to the Probationary advance step in `src/components/modules/NewHireOnboarding.tsx`.
- No database or backend changes.
