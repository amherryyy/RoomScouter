# 0004: Run identity authorization tests against in-process PostgreSQL

## Status

Accepted

## Context

RoomScouter's identity migration relies on PostgreSQL grants, triggers, roles, and row-level security. Source-text assertions can detect accidental edits, but they cannot prove that PostgreSQL enforces the intended behavior. Requiring a shared hosted database for every test would make the security suite slower, stateful, and dependent on credentials. The current development machine also does not have Docker, PostgreSQL, or the Supabase CLI installed.

## Decision

Use PGlite as an ephemeral PostgreSQL-compatible database for executable migration authorization tests. Each test database creates only the minimal Supabase role and `auth` schema surface required by the migration, then applies the real migration without rewriting it.

The suite switches into the `anon` and `authenticated` database roles and supplies the current user through the same `auth.uid()` contract used by Supabase. Privileged setup remains confined to deterministic test fixtures. A denied operation must be observed before the harness is trusted.

These tests complement rather than replace tests against a real Supabase environment. Supabase Auth delivery, cookie behavior, email confirmation, and hosted configuration still require integration or end-to-end coverage.

## Consequences

- Profile grants, triggers, column permissions, and RLS run on every ordinary test invocation.
- The tests need no database daemon, Docker service, network connection, or secret.
- Test setup must remain a minimal emulation of Supabase-owned database objects and must not grow into a replacement for Supabase.
- A later hosted integration suite remains necessary for behavior outside PostgreSQL itself.
