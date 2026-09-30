# ADR 0017: Seed pilot scenarios only through the local Supabase stack

- Status: Accepted
- Date: 2026-09-30

## Context

Pilot demonstrations and future browser tests need stable identities and realistic domain records. A conventional SQL seed attached to database reset can be accidentally directed at a linked hosted project, and embedding service credentials in application configuration would weaken the security boundary.

## Decision

Disable automatic SQL seeding and provide an explicit Node.js command that obtains its administrator credential only from `supabase status` for the running local stack. Before creating a client, the command requires plain HTTP, a loopback hostname, and port 54321. It never reads hosted project environment variables.

Create four confirmed local identities, promote one local profile for administration, and recreate a fixed set of fictional listings, attributes, moderation events, reviews, favorites, and reports. Repeated runs delete only the fixed demo identifiers before rebuilding the scenario.

## Consequences

- The command cannot seed the linked hosted project even when `.env.local` points to it.
- Local demonstrations use known credentials and deterministic domain identifiers.
- Docker and the local Supabase stack are required to materialize the scenario.
- Demo photos remain a separate concern because storage objects require licensed binary fixtures.
