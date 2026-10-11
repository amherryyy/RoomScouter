# UI design handoff

This document connects the team's initial RoomScouter wireframe to the working pilot. It prevents visual work from accidentally promising behavior that the application does not yet support.

## Screen map

| Wireframe screen | Current route | State |
| --- | --- | --- |
| Landing and student browse | `/`, `/browse` | Landing page features approved listings and a sign-up call to action for visitors; browse page provides database-backed search, filters, and paginated public results. Entire listing cards link to their detail page. |
| Login and account recovery | `/login`, `/forgot-password`, `/update-password` | Working with a shared responsive authentication layout. |
| Registration and email verification | `/register`, `/verify-email` | Working for student and owner roles. New accounts confirm email with a six digit code. |
| Property details | `/listings/[id]` | Working for approved, available listings. |
| Map view | `/map` | Interactive map and matching public listing results; search filters stay synchronized with Browse. Includes NVSU label, barangay names/boundaries, street and satellite styles, visible attribution, and mobile full-screen control. |
| Favorites | `/favorites` | Working for signed-in students. |
| Signed-in account profile | `/account` | Working; users can update their display name, review read-only email and role details, access password recovery, and open role-specific destinations. |
| Owner dashboard | `/owner` | Working with truthful listing lifecycle totals; views and inquiries remain a labeled future concept. |
| Add and edit property | `/owner/listings/new`, `/owner/listings/[id]/edit` | Working. |
| Administrator dashboard | `/admin` | Working, with truthful account, property, pending-listing, and open-report totals plus separate moderation queues. |
| About, help, contact, and license | `/about` | Working informational cards for project contact, future help/FAQ content, and MIT license. The developer contact action opens this page. |
| Report a website problem | Footer/menu form | Collects a message on RoomScouter and prepares a GitHub issue from it; this is separate from private reports about listings and reviews. |

## Product boundaries

The final interface may style working behavior freely, but it must preserve these boundaries:

- Only approved listings with available rooms are public.
- Owners can change only their own listings.
- Students' favorites and reports are private.
- Reviews do not expose student profile details publicly.
- Administrator access cannot be selected during public registration.
- RoomScouter supports discovery and direct owner contact; it does not process reservations, leases, or payments.
- Approximate travel times use an estimated road-detour factor and average speeds. They are not route directions or promises of actual travel time.

## Future concepts shown in the wireframe

The following concepts require separate product and architecture decisions before interactive controls are added:

- in-application messaging or owner inquiries;
- Google or Facebook authentication;
- listing views, inquiry totals, or other analytics;
- editable email addresses and account roles;
- featured-property ranking;
- social sharing.

Until approved, these concepts must be omitted or presented as clearly non-interactive previews. Disabled controls must not be used as a substitute for honest status text.

The project operator/PIC and accountable privacy contact also remain to be confirmed. Do not present the privacy notice as complete until those details and the actions in the [privacy baseline](privacy-and-security-baseline.md) are resolved.

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
