# ADR 0012: Treat student reports as private, append-only moderation requests

- Status: Accepted
- Date: 2026-09-28

## Context

Students need to flag inaccurate listings and inappropriate reviews. Reports contain a student's allegation and browsing context, so they must not become public community content. The system must also prevent reports against content that is not publicly visible and avoid duplicate open cases from the same student.

## Decision

Store reports as private student-owned records targeting exactly one listing or review. A database trigger validates the authenticated student, trims the reason, and permits only approved available listings or published reviews. Partial unique indexes allow at most one open report from a student for each target.

Students may submit and read their own reports but cannot edit or delete them. Administrators may read all reports for the future moderation queue. Resolution state, responsible administrator, timestamp, and note are present now, while the audited transition command is deferred to the administration milestone.

## Consequences

- Owners and other students cannot discover who reported content.
- Submitted reasons remain unchanged while a case is open.
- Duplicate open cases are rejected without preventing a later report after resolution.
- Report resolution requires an administrator-only command and interface in the administration milestone.
