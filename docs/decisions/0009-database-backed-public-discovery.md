# ADR 0009: Query public discovery through a paginated database function

- Status: Accepted
- Date: 2026-09-28

## Context

Public discovery combines text, price, availability, room-type, facility, utility, and distance filters. Filtering a complete listing table in the browser would bypass the performance requirement and duplicate geographic calculations across clients. Public results must also retain the listing publication boundary enforced by row-level security.

## Decision

Expose a stable, security-invoker PostgreSQL function for public listing discovery. It explicitly selects approved listings with available rooms, composes every pilot filter, calculates straight-line Haversine distance when university coordinates are configured, and applies bounded pagination before returning rows. Full-text matching uses PostgreSQL's `simple` configuration and a partial GIN index over public-searchable listing content.

The function remains subject to normal row-level security and is executable by anonymous and authenticated callers. Result rows do not include owner contact information; contact details are loaded only on an individual public listing page.

## Consequences

- Browsers receive at most 50 result rows per request; the application uses 12.
- Distance is deterministic, approximate, and never described as travel distance or time.
- Facility and utility filters use controlled catalog identifiers.
- The deployment must provide university name and coordinates before distance and map acceptance is complete.
- Search evolution requires measured need and a new decision rather than client-side full-table filtering.
