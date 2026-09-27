# ADR 0006: Enforce the listing lifecycle in PostgreSQL

- Status: Accepted
- Date: 2026-09-27

## Context

Owners need to maintain listings while administrators retain exclusive control over publication. Interface-only checks would allow direct API calls to bypass ownership and moderation. Approved listings also need a narrow availability update that does not force repeated moderation, while material edits must be reviewed again.

## Decision

Store the lifecycle as a constrained PostgreSQL enum and expose submission and moderation through security-definer functions with explicit actor and transition checks. Direct application updates cannot write lifecycle or moderation columns.

Row-level security grants owners access only to their listings, administrators access to all listings, and public readers access only to approved listings with available rooms. A trigger returns an approved listing to `pending` when its owner changes material fields; changing only `available_rooms` preserves approval. Every approval, rejection, and archival creates an immutable moderation event.

## Consequences

- Direct API calls cannot self-publish or cross owner boundaries.
- Rejected listings can be corrected and resubmitted.
- Rejections and archival require a non-empty reason.
- Availability can change rapidly without repeating content review.
- Listing attributes, photos, and owner UI remain separate follow-up slices built on this lifecycle.
