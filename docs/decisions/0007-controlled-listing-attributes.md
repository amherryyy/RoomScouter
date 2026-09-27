# ADR 0007: Use controlled catalogs for comparable listing attributes

- Status: Accepted
- Date: 2026-09-27

## Context

Facilities and utilities must support reliable filtering and comparison. Allowing every owner to invent labels would produce duplicates and inconsistent spelling. Attribute records also need the same ownership and publication boundaries as their parent listing, and material attribute changes to approved content require another review.

## Decision

Store facilities and utilities in read-only, seeded catalogs with case-insensitive uniqueness. Owners associate catalog entries with their listings through unique join tables. Utility associations explicitly record whether a utility is included and may include a short explanation. House rules are listing-owned, ordered records with unique positions.

Child-table row-level policies inherit visibility from the parent boarding house. Only the listing owner or an administrator can mutate its attributes. Owner mutations to an approved listing atomically return the parent to `pending`; administrator corrections do not change its lifecycle.

Owner forms replace each complete attribute collection through guarded database functions. Each function validates the full selection and applies it in one transaction. Equivalent selections are detected as no-ops so merely saving an unchanged approved listing does not trigger another review.

## Consequences

- Search filters operate on stable identifiers rather than free-form labels.
- Public readers cannot discover attributes belonging to unpublished listings.
- Cross-owner attribute writes fail closed.
- Catalog expansion requires a reviewed migration rather than an owner-facing form.
- Photos remain a separate storage-focused slice.
