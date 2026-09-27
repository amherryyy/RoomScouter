# ADR 0008: Store listing photos in a private, path-scoped bucket

- Status: Accepted
- Date: 2026-09-27

## Context

Listing photos must be owner-managed, ordered, and hidden until a listing is published. Public bucket URLs would bypass listing moderation, while trusting client-supplied paths or metadata would allow cross-owner access and policy drift. Flower's upload policy permits PNG and JPEG files up to 10 MiB, alongside PDF files that are not appropriate for listing photos.

## Decision

Create a private `listing-photos` bucket limited to JPEG and PNG objects up to 10 MiB. Object names follow `<owner-id>/<listing-id>/<object-id>.<extension>`. Storage policies validate that the authenticated actor owns the path's listing or is an administrator.

Store ordered photo metadata in `public.listing_photos`. A database trigger verifies the corresponding Storage object, MIME type, byte size, owner/listing path, creator, maximum count of ten, unique position, and required alternative text. Public metadata and object reads require a publicly visible parent listing. Owner metadata changes return approved listings to pending review.

## Consequences

- Storage objects cannot bypass listing publication rules.
- The application uploads the object before inserting its metadata row.
- Stored objects are immutable; replacements use a new UUID path.
- Deletion removes metadata first to hide the object, then deletes the private object.
- Orphan cleanup is an operational follow-up and must never make objects public.
- PDF remains allowed by Flower's general upload policy but is rejected by this product-specific bucket.
