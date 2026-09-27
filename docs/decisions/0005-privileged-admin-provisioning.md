# ADR 0005: Provision administrators through a restricted database function

- Status: Accepted
- Date: 2026-09-27

## Context

RoomScouter needs at least one administrator before moderation features can be exercised. Public registration must never accept the administrator role, and introducing a service-role credential into the application solely for initial setup would expand the trusted runtime unnecessarily.

## Decision

Provide `public.provision_admin(text)` as an idempotent, security-definer database function. It promotes an existing authentication user identified by normalized email and fails when that user or profile does not exist.

Execution is revoked from `public`, `anon`, and `authenticated` and granted only to PostgreSQL's privileged `postgres` role. Operators invoke it through a reviewed, privileged database session such as the Supabase SQL Editor. The browser and Next.js application receive neither access to the function nor a service-role credential.

## Consequences

- A user must register and obtain a profile before being promoted.
- Repeating the operation for the same account is safe.
- Public and authenticated application clients cannot promote accounts.
- The operation is manual and intentionally rare; a broader administrator-management UI requires a separate authorization and audit design.
