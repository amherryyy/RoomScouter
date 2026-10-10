# ADR 0014: Barangay-aware listing discovery

- Status: Accepted
- Date: 2026-10-10

## Context

Students need to narrow local boarding house listings by barangay and recognize a listing's barangay before opening its details. Owners need to provide a structured barangay value in addition to the street address.

## Decision

- Store a trimmed barangay name on each listing, require it in owner listing forms, and retain `NULL` for records created before this field exists until their owners update them.
- Include barangay in full-text search and expose a case-insensitive exact-match filter through the existing security-invoker discovery function.
- Populate public filter options only from approved listings with available rooms. Do not send unpublished owner listing locations to public search controls.
- Reuse the same search and filters on Browse and the map. Show barangay alongside listing addresses in owner, public, and moderation views.
- Editing barangay on an approved listing returns it to administrator review, following the existing location-change behavior.

## Consequences

- Legacy listings continue to work, but will not appear under a barangay filter until updated by their owners.
- Barangay labels are owner-provided and remain subject to administrator review; the application does not geocode or infer a barangay from the address or coordinates.
