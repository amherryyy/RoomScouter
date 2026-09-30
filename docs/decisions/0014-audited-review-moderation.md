# ADR 0014: Hide and restore reviews through audited commands

- Status: Accepted
- Date: 2026-09-30

## Context

Student reviews are publicly visible community content. The original review schema reserved moderation state, but a direct table update would not reliably validate transitions or preserve a durable history of administrator decisions.

## Decision

Expose one security-definer command that permits administrators to hide a published review or restore a hidden review. Every transition requires a bounded reason and appends an immutable event containing the review, listing, administrator, action, reason, and timestamp.

The current hidden reason remains visible to the review author. Restoring a review clears its current moderation fields because those fields describe only an active hidden state; the append-only event history retains both decisions. Administrators use a paginated interface that does not expose student identity.

## Consequences

- Review moderation cannot be performed by students or by changing browser state.
- Public review lists and rating summaries immediately exclude hidden reviews.
- Restored reviews become public again while the complete decision history remains available to administrators.
- Resolving reports that point to reviews remains a separate administration slice.
