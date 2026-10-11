# Version 0.1 Requirements

## Functional requirements

| ID | Requirement | Acceptance summary |
| --- | --- | --- |
| FR-01 | Users can register, log in, and log out. | A valid session is created and revoked through Supabase Auth. |
| FR-01a | New accounts verify their email with a six digit code. | The code-entry flow is available after registration; recovery emails continue to use a separate PKCE link. |
| FR-02 | Each profile has exactly one application role: student, owner, or admin. | Protected actions reject every role not explicitly permitted. |
| FR-03 | Owners can create and edit their own listings. | Ownership is enforced by database policy, not only by the interface. |
| FR-04 | Owners can submit listings for moderation. | New public listings cannot bypass pending review. |
| FR-05 | Admins can approve, reject, and archive listings. | Only admins can cause a listing to become publicly visible. |
| FR-06 | Anyone can browse approved, available listings. | Draft, pending, rejected, and archived records are not exposed publicly. |
| FR-07 | Users can search and filter listings. | Filters cover price, distance, availability, room type, facilities, and utilities. |
| FR-08 | Listing pages show decision-relevant details. | Address, distance, rent, availability, photos, facilities, utilities, rules, and contact details are presented. |
| FR-09 | Listing locations appear relative to the configured university. | Stored coordinates produce a deterministic approximate distance. |
| FR-09a | Students can inspect approximate walk, bicycle, and tricycle travel times on listing details. | Estimates apply a documented road-detour factor to straight-line distance and show a short approximation disclaimer; no route provider or live traffic is implied. |
| FR-09b | Students can explore listings on an interactive map. | Map and Browse use the same public listing results; map includes NVSU and barangay labels, street/satellite choices, attribution, and a mobile full-screen option. |
| FR-10 | Students can add and remove favorites. | A listing can occur at most once in a student's favorites. |
| FR-11 | Students can create and edit a simple review. | One review per student per listing; rating is an integer from one through five. |
| FR-12 | Students can report a listing or review. | A report enters the admin queue with a reason and open status. |
| FR-13 | Admins can moderate reviews and resolve reports. | Outcomes and responsible admin are recorded. |
| FR-14 | Owners can upload and order listing photos. | Upload policy restricts type, size, count, and ownership. |
| FR-15 | Listing cards open the corresponding detail page when selected. | The full card is an accessible link, except for any nested independent controls. |
| FR-16 | The app supports a responsive light/dark theme and compact navigation. | Header and content remain usable at phone, tablet, and desktop widths in both themes. |
| FR-17 | Visitors can report a website problem through the app. | A website form prepares a GitHub issue from the submitted message; it does not expose private listing reports. |

## Non-functional requirements

| ID | Requirement | Measure |
| --- | --- | --- |
| NFR-01 | Mobile usability | Primary workflows function at a 360 px viewport without horizontal scrolling. |
| NFR-02 | Performance | A typical filtered result page over hundreds of listings responds without full-table client downloads. |
| NFR-03 | Authorization | Row-level security denies cross-user and cross-owner writes even when the API is called directly. |
| NFR-04 | Data integrity | Database constraints protect roles, ratings, prices, availability counts, coordinates, and relationship uniqueness. |
| NFR-05 | Privacy | Secrets remain server-side; logs exclude contact details, addresses, credentials, and request bodies. |
| NFR-06 | Accessibility | Core workflows support keyboard use, visible focus, labels, semantic headings, and meaningful image alternatives. |
| NFR-07 | Maintainability | Domain behavior is grouped by feature and validated at database, service, and user-flow boundaries. |
| NFR-08 | Reliability | Migrations are versioned; failed writes do not leave partial listing or moderation state. |

## Listing lifecycle

```text
draft -> pending -> approved
   ^         |          |
   |         v          v
   +----- rejected   archived
```

- Owners create drafts and submit them as pending.
- Admins approve or reject pending listings.
- A rejected listing may be corrected and resubmitted.
- Admins may archive an approved listing.
- Material owner edits to an approved listing must return it to pending review; room availability may be updated without changing publication status.

## Delivery milestones

1. **Product contract:** scope, model, permissions, and acceptance criteria are agreed and tested as repository artifacts.
2. **Identity foundation:** Supabase Auth, profiles, roles, route protection, and seeded development identities.
3. **Data and security:** domain migrations, constraints, indexes, storage policy, and RLS behavior tests.
4. **Owner workflow:** dashboard, listing editor, photos, availability, and moderation submission.
5. **Student discovery:** browse, details, search, filters, comparison facts, map, and distance.
6. **Community actions:** favorites, reviews, and reports.
7. **Administration:** listing approval, report handling, review moderation, and audit visibility.
8. **Pilot hardening:** responsive and accessibility review, realistic seed data, end-to-end tests, deployment rehearsal, and demonstration script.

Keep the automated test suite, type-checking, linting, and production build passing for code changes. Structural Flower validation is part of the project checks. The Flower security check currently reports known dependency-license diagnostics in this pre-release pilot; this is an open readiness issue, not a passing check. See [pilot findings](pilot-findings.md). The team reports that hosted email verification and password recovery have been tested successfully; local browser automation uses pre-confirmed demo identities.

## Security and validation policy

See [Errors and Restrictions Policy](error-and-restriction-policy.md) for the consolidated role permissions, input limits, error behavior, and open product decisions.
