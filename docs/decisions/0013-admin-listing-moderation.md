# ADR 0013: Moderate listings through an admin-only review workspace

- Status: Accepted
- Date: 2026-09-30

## Context

The database already restricts listing approval, rejection, and archival to administrators and records every outcome. The application still needs a safe interface that lets an administrator inspect the complete submission before invoking those transitions.

## Decision

Provide admin-only, paginated queues for pending and published listings. A separate review page displays listing facts, owner identity, contact details, controlled attributes, private photo previews, and prior decisions. Server actions verify the current profile is an administrator, validate moderation reasons, and call the existing `moderate_boarding_house` database command.

Approval is available only for pending listings. Rejection requires owner-facing guidance, and archival requires a reason. The PostgreSQL function remains the final authority for roles, valid transitions, state changes, and append-only event creation.

## Consequences

- Listing publication cannot be initiated by a browser-only role check.
- Administrators can review non-public photos without making the storage bucket public.
- Owners continue receiving rejection and archival explanations through existing listing metadata.
- Review moderation and report resolution remain separate administration slices.
