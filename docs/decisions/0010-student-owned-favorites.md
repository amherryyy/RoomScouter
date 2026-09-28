# ADR 0010: Keep favorites private and student-owned

- Status: Accepted
- Date: 2026-09-28

## Context

Students need a small personal shortlist of boarding houses. A favorite reveals browsing intent and therefore must not be visible to owners, other students, visitors, or administrators during normal application use. A listing should not be saved more than once by the same student, and unpublished listings must not be newly favorited.

## Decision

Store favorites as a composite student/listing relation. The composite primary key prevents duplicates. Row-level policies permit only an authenticated student to select, insert, or delete rows carrying their own profile identifier. New favorites additionally require an approved listing with at least one available room.

There is no update operation and no normal administrator read policy. If a listing later becomes unavailable or unpublished, the relation may remain private in storage, but public listing policy prevents it from appearing in the student's active favorites view.

## Consequences

- Favorites remain private personal data.
- Owners cannot learn who saved their listings.
- The application can implement add/remove as idempotent commands around a unique relation.
- Archived or unavailable listings disappear from the active favorites page without requiring destructive history cleanup.
