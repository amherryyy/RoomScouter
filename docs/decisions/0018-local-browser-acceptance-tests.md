# 0018: Run browser acceptance tests only against the guarded local stack

## Status

Accepted

## Context

RoomScouter's unit, contract, and ephemeral PostgreSQL tests prove individual boundaries, but they do not prove that cookies, Next.js server actions, pages, and Supabase work together through a real browser. Running a state-changing browser suite against the linked hosted project would make tests unsafe and nondeterministic.

## Decision

The pilot uses Playwright with one Chromium worker to exercise serial student, owner, and administrator journeys. A dedicated runner obtains the API URL and public key from the running local Supabase CLI, applies the existing loopback URL guard, and refreshes deterministic demo data before starting the application.

The Next.js process receives those verified local values directly. It does not derive its database target from `.env.local`, and neither the browser nor the application receives the local administrator key. Browser artifacts and downloaded test browsers remain untracked.

## Consequences

- The complete acceptance suite requires Docker Desktop, local Supabase, and a one-time Chromium download.
- Normal repository tests remain fast and do not require Docker or a browser.
- Each acceptance run resets the known fictional demo scenario, so tests can depend on stable accounts and records.
- Serial role journeys may share intentional database state without race conditions.
- Hosted Supabase data cannot be changed by the browser-test runner.
