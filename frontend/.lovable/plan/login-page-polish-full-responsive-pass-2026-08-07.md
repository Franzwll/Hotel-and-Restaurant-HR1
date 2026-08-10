# Login page polish + full responsive pass

Frontend only. Same cream/beige/burgundy palette, same hero photo, same auth behaviour (role tabs, demo credentials, validation, OTP redirect).

## What changes visually

**Left property panel**
- Rebuild the content stack on a single left alignment axis: gold rule, headline, supporting line, and the property/access/contact list all start on the same edge, with consistent vertical rhythm between them instead of the current mixed gaps.
- Move the logo + "Staff Portal" badge into a fixed top row, keep the headline block anchored to the lower third, so the panel reads top / bottom rather than one bottom-heavy cluster.
- Cap the text column width so headline lines break predictably; keep the headline as a fluid clamp but tune it so it never collapses to 3+ lines on a narrow panel or over-scales on ultrawide.
- Keep the layered scrims but tighten them so the text side stays dark enough for contrast while the photo remains visible on the opposite side at every ratio.
- Property facts row: switch from a rigid 3-column grid to a wrapping row so labels never truncate mid-word on a narrow panel.

**Right credential panel**
- Align every element to one axis: eyebrow, heading, subtitle, gold rule, role tabs, labels, inputs, helper text, and button share the same left edge and container width.
- Normalise spacing scale (heading → subtitle → rule → tabs → helper → form → footer) so the form no longer has uneven gaps.
- Role tabs: equal-height cells, centred icon + label, no text wrap at any width; helper line under the tabs reserves a fixed height so switching roles doesn't shift the form.
- Inputs, error message, remember/forgot row, and submit button get consistent height and gap; the remember/forgot row becomes a wrapping two-part row so it doesn't squash on small phones.

## Responsive behaviour

| Width | Layout |
| --- | --- |
| < 640px | Single column, mobile logo top, form fills width with comfortable side padding, no horizontal scroll |
| 640–1023px | Single column, form centred with a max width, larger type |
| 1024–1279px | Two columns; hero panel narrower, headline steps down so it stays 2 lines |
| 1280px+ | Two columns at the current ratio |
| Ultrawide / short height | Hero content stays vertically centred-to-bottom without overflow; form panel scrolls internally rather than clipping |

Also handled: short viewports (~700px tall) where the hero stack currently risks overflow, and the 1024–1100px band the user is currently viewing where the hero panel is at its narrowest.

## Technical notes

- `src/routes/login.tsx` only.
- Hero panel: `flex flex-col justify-between` with fixed top row + bottom stack, `max-w-[34ch]`-style measure on the headline, `min-h-0` + `overflow-hidden` guards, clamp values retuned (headline `clamp(1.75rem, 2.6vw, 3rem)`).
- Property facts: `flex flex-wrap gap-x-8 gap-y-4` instead of `grid-cols-3`.
- Form panel: one wrapper with a single spacing scale (`space-y-*` on grouped blocks instead of per-element `mt-*`), role tab buttons get `min-h` + `leading-tight`, helper paragraph gets `min-h-[2rem]`.
- Verify in the browser at 390x844, 768x1024, 1094x863, 1440x900, 1280x700, and 1920x1080; check no horizontal overflow and no layout shift when switching role tabs.
