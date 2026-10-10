# ADR 0010: Interactive public listing map

- Status: Accepted
- Date: 2026-10-10

## Context

The `/map` route was an explicitly labeled wireframe. The product now needs a working map that helps students compare real available listings without creating a second, less-protected discovery path.

## Decision

- Render the map and its result list from `search_public_boarding_houses`, the same security-invoker function used by Browse. Keep the approved and available listing boundary, query filters, and approximate university distance consistent.
- Display up to 50 matching listings per map page, the database function's existing upper bound. Paginate any additional matches; do not load the full listing table into the browser.
- Provide a price marker, keyboard-accessible matching result, and a listing-details link. Selecting either a marker or result identifies the same listing. Do not add visitor geolocation, routing, reservation, or messaging behavior.
- Load map tiles from a configurable provider. OpenStreetMap is the default and must keep its attribution visible and send only normal requests for tiles in the current view. Do not prefetch or offer offline downloads.
- Show only public listing fields on the map and result cards. Owner contact details remain on an individual approved listing page.

## Consequences

- Tile requests go directly from the browser to the configured provider; the Privacy Notice describes the default provider and data shared with it.
- The OpenStreetMap standard tile service is best-effort. Reassess the provider if usage grows or a service-level guarantee becomes necessary.
- Barangay search and filtering are implemented with the shared discovery query. See [ADR 0014](0014-barangay-discovery.md).
