# ADR 0011: Publish student reviews without exposing profile data

- Status: Accepted
- Date: 2026-09-28

## Context

Students need one simple rating and comment per boarding house. Reviews are public community content and require a future administrator moderation workflow. Public readers need the content and aggregate rating, but they do not need access to student profiles or email addresses.

## Decision

Store one review per student/listing pair with a constrained one-to-five rating, a bounded comment, publication status, moderation metadata, and timestamps. Students may create reviews only for approved listings with available rooms. They may read, edit, and delete only their own review. Student updates are limited to rating and comment.

Published reviews are readable with a publicly visible parent listing. Review rows do not join to public profile data, so the initial pilot displays them without student identity. Hidden reviews remain visible to their author and administrators for transparency and moderation follow-up.

Public clients read a narrow security-invoker view that omits the student identifier and moderation fields. A separately scoped function returns the current student's own review, while another public function calculates the published count and average without exposing underlying ownership.

## Consequences

- Duplicate reviews and out-of-range ratings are rejected by PostgreSQL.
- Public review display does not reveal student account information.
- The schema is ready for audited administrator hide/restore commands in the administration milestone.
- A future report may target a review UUID without changing review ownership.
