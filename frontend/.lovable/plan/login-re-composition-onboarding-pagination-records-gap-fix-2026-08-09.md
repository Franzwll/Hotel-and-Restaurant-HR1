# Login re-composition + onboarding pagination + records gap fix

Frontend only. Same palette (cream/beige/burgundy/gold), same auth flow (role tabs, demo credentials, OTP redirect).

## 1. Login — new left-panel composition with a cinematic photo loop

The left panel becomes a slow cinematic slideshow built from the hotel photos already uploaded (lobby interiors, deluxe twin, junior suite, O suite, conference room):

- Each image holds for a few seconds with a very slow Ken Burns zoom/pan, then cross-fades into the next — reads as ambient video, no real video file, no generation cost.
- A loading state runs until the first image decodes: a soft brand-tinted shimmer over the panel with the logo and a thin gold progress line, so the panel never flashes empty.
- Images preload in the background; the slideshow only advances once the next frame is ready, and it respects `prefers-reduced-motion` (static hero, no pan, no crossfade).

New composition on top of the loop:

- Full-bleed imagery with a layered scrim (brand tint + bottom-left depth gradient + vignette) tuned so the photo stays visible while text keeps contrast.
- A floating glass content card anchored to the lower-left instead of the current flat text stack: gold hairline, headline, one supporting line, and the pull quote.
- Content reveals on mount with a short staggered fade/rise (headline → subline → quote → facts).
- Slide indicators: small gold ticks bottom-right showing which frame is active, clickable to jump.
- Top row keeps the logo and the property badge; the facts row (Client / Industry / Platform) moves into the glass card footer as a single wrapping row.

Right credential panel stays functionally identical, restyled to match: same gold rule and spacing rhythm, slightly softer card surface, subtle entrance animation, unchanged role tabs, inputs, and buttons.

Responsive: panel hidden below 1024px as today; card measure, headline clamp, and paddings tuned for 1024–1279, 1280+, ultrawide, and short (~700px tall) viewports with no overflow.

## 2. New Hire Onboarding — pagination in Requested Checklists

The Requested Checklists card gets the same pagination pattern used elsewhere in the portal (`usePagination`), with the page controls pinned to the bottom of the card. Card height stays fixed and aligned with Checklist Builder — page size is chosen so a full page fits without the card growing or shrinking.

## 3. Employee Records — remove the white gap in the 201 file view

In the record view dialog, the block containing the header (Employee Name, Department, Position, Employee ID) and the tab sections (Personal Information / Documents / Employment History) currently has extra vertical space between the header and the tabs. The whole content block shifts upward as one unit — spacing *between* the individual sections is unchanged, only the dead gap under the header is removed.

## Technical notes

- `src/routes/login.tsx`: local `slides` array referencing the uploaded photos via Lovable asset pointers (`src/assets/*.asset.json`); slideshow driven by a small `useEffect` interval + `onLoad` gate; CSS transform/opacity transitions only (no library). Reduced-motion via `matchMedia`.
- The uploaded images are registered as CDN assets with `lovable-assets create`, not committed as binaries.
- `src/components/modules/NewHireOnboarding.tsx`: wrap the checklist request list in `usePagination`, render existing pagination controls in the card footer, keep `h-[46rem]` + internal scroll.
- `src/components/modules/EmployeeRecords.tsx`: tighten the dialog content stack (`DialogContent` gap / `DialogHeader` bottom spacing and the tabs wrapper margin) so the header and tabs sit flush; per-section spacing untouched.
- Verify in browser at 390, 1024, 1280, 1920 widths and at 1280x700.
