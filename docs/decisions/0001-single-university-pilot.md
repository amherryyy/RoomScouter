# ADR 0001: Single-university moderated pilot

- Status: Accepted
- Date: 2026-09-26

## Context

The broader idea could expand into bookings, payments, multiple universities, messaging, and marketplace features. Building those capabilities now would obscure whether the core discovery problem has been solved and make authorization substantially harder to verify.

## Decision

Version 0.1 serves one configured university and uses a single Next.js/Supabase application. Listings require administrator approval before public visibility. Students, owners, and administrators are explicit roles. PostgreSQL row-level security enforces ownership and moderation boundaries.

The pilot calculates approximate straight-line distance from stored coordinates and does not implement route planning or GPS tracking. Contact occurs through listing details rather than an internal chat system.

## Consequences

- The project can demonstrate a complete listing lifecycle within school-project constraints.
- Moderation and authorization are designed before feature screens.
- University identity and coordinates must be configured before map acceptance tests pass.
- Multi-university tenancy, booking, payment, and messaging require later decisions and are not implied by the initial schema.
