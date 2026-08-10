# Fix missing images, ranking layout, duplicate hires, interview card heights

## 1. Missing logos and login background

Every image in the app is currently served through CDN pointer files, and all of them fail to load — the tower photo, the white sidebar mark and the maroon landing mark all return "not found" from the preview. That is why the login panel shows no photo and no logo, and the landing header shows no mark.

Fix: re-create the asset pointers from the freshly uploaded files (`unnamed.webp` for the tower, the white logo, the default maroon logo) and repoint `Logo.tsx` and the login page at the new pointers. Verify each new URL actually loads before finishing.

## 2. Login left panel background

Once the photo loads, restyle the panel so the portrait tower shot fills the panel edge-to-edge (cover, top-anchored so the tower stays visible) instead of the current letterboxed "contain" fit. Keep the burgundy overlay plus bottom gradient so the logo, headline and footer line stay readable, and keep it responsive across tall and short viewports.

## 3. Candidate Ranking layout

Match the uploaded reference: donut chart on the left, the four-row legend/grid on the right, both vertically centered and the pair centered as one cluster in the card, with balanced padding so the card no longer looks stretched.

## 4. Accepted applicant appears twice in New Hire Onboarding

The accept flow hands a pending applicant to onboarding, which files it as Pre-onboarding. The row currently lands twice. Exact trigger is unconfirmed, so step one is to reproduce an accept in the browser and confirm the handoff fires once; then guard the handoff so a given applicant can only ever be added once (processed-id guard plus a duplicate check in the hire store).

## 5. Interview scheduling cards

- Tighten the Interview Calendar card: remove the dead vertical gap under the calendar/scheduled-applicant list so content fills the card.
- Reduce overall height of both Interview Calendar and Book an Interview cards (tighter paddings/spacing, scrolling list for scheduled applicants) so the two sit at a shorter, matched height.
- Compact the Booking progress block and the already-scheduled applicant list in the same pass.

## Technical notes

- `lovable-assets create` from `/mnt/user-uploads/*` → new `*.asset.json` pointers; update `src/components/brand/Logo.tsx` and `src/routes/login.tsx`; delete stale pointers.
- `login.tsx`: swap `object-contain` for `object-cover object-top`, drop the blurred backdrop layer, keep scrims.
- `ApplicantManagement.tsx`: ranking grid → centered flex row (`items-center justify-center`); calendar/booking cards get reduced padding + `max-h` scroll on the scheduled list.
- `NewHireOnboarding.tsx` / `src/data/hires.ts`: idempotent pending-hire intake.
