# UI design handoff

This document connects the team's initial RoomScouter wireframe to the working pilot. It prevents visual work from accidentally promising behavior that the application does not yet support.

## Screen map

| Wireframe screen | Current route | State |
| --- | --- | --- |
| Landing and student browse | `/` | Working; the pilot combines landing, search, filters, and results. |
| Login | `/login` | Working. |
| Registration | `/register` | Working for student and owner roles. |
| Property details | `/listings/[id]` | Working for approved, available listings. |
| Map view | `/map` | Preview only; clearly marked under construction. |
| Favorites | `/favorites` | Working for signed-in students. |
| Student profile | `/account` | Partial; identity and role are shown, but profile editing is not implemented. |
| Owner dashboard | `/owner` | Working with truthful listing lifecycle totals; views and inquiries remain a labeled future concept. |
| Add and edit property | `/owner/listings/new`, `/owner/listings/[id]/edit` | Working. |
| Administrator dashboard | `/admin` | Working, with truthful account, property, pending-listing, and open-report totals plus separate moderation queues. |
| About | `/about` | Working informational page. |

## Product boundaries

The final interface may style working behavior freely, but it must preserve these boundaries:

- Only approved listings with available rooms are public.
- Owners can change only their own listings.
- Students' favorites and reports are private.
- Reviews do not expose student profile details publicly.
- Administrator access cannot be selected during public registration.
- RoomScouter supports discovery and direct owner contact; it does not process reservations, leases, or payments.

## Future concepts shown in the wireframe

The following concepts require separate product and architecture decisions before interactive controls are added:

- an interactive map with synchronized listing filters;
- in-application messaging or owner inquiries;
- Google or Facebook authentication;
- listing views, inquiry totals, or other analytics;
- editable student profiles;
- featured-property ranking;
- social sharing.

Until approved, these concepts must be omitted or presented as clearly non-interactive previews. Disabled controls must not be used as a substitute for honest status text.

## Implementation guidance

- Reuse semantic headings, landmarks, labels, live regions, and keyboard behavior already covered by accessibility tests.
- Preserve the existing server actions and database authorization instead of moving security decisions into client components.
- Build repeated visuals as shared components rather than copying page markup.
- Design mobile layouts alongside desktop layouts.
- Supply meaningful alternative text for real listing images; decorative wireframe imagery should be hidden from assistive technology.
- Keep loading, empty, error, success, and moderation states in every final screen design.

## Visual direction from the team wireframes

The team's low-fidelity screens establish a useful foundation: generous whitespace, centered auth cards, restrained navigation, clear form boundaries, and property-first discovery. Implementation should refine that foundation rather than reproduce placeholder gray boxes literally.

- Use calm neutral surfaces with RoomScouter blue and green for hierarchy, actions, and trustworthy status cues.
- Keep primary tasks obvious through one dominant heading and one primary action per section.
- Prefer rounded, lightly elevated cards with consistent spacing over dense dashboard chrome.
- Preserve readable labels above inputs; placeholders supplement labels and never replace them.
- Let role workspaces share the same visual system while prioritizing different real actions and data.
- Treat the current wireframes as layout intent; responsive, accessible behavior and truthful product state take priority over pixel matching.
