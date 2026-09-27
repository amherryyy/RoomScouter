# ADR 0002: Application roles instead of organization-scoped RBAC

- Status: Accepted
- Date: 2026-09-26

## Context

Flower's official `rbac` module depends on `organizations` and defines role and permission scope per organization. RoomScouter version 0.1 serves one university and uses three application-wide roles: student, owner, and admin. A dry-run confirmed that adding `rbac` would install `auth`, `organizations`, and `rbac` together.

Introducing organizations solely to reuse that module would create a tenant model the product does not have. It would also make ownership, moderation, and row-level policies harder to explain and test.

## Decision

Install Flower's `auth` module only. The application owns a `profiles` table with a constrained `app_role` enum. Students and owners may choose those two roles during registration; administrator access cannot be self-assigned. PostgreSQL row-level security and explicit database functions enforce data access.

The browser uses Supabase's publishable client credentials. Session cookies are managed through `@supabase/ssr`, refreshed by the Next.js proxy, and verified server-side with `getUser()` before protected data is read.

## Consequences

- The data model matches the actual pilot instead of simulating tenancy.
- Flower still records and verifies the identity/session capability.
- Project migrations and tests own application-role semantics.
- An organization-scoped RBAC migration remains possible only if multi-university tenancy becomes a real requirement.
- Administrator assignment is a privileged deployment operation governed by ADR 0005.
