# 0019: Fail closed before deployment rehearsal

## Status

Accepted

## Context

RoomScouter can build with placeholder or development environment values, but a successful build alone does not prove that a hosted deployment points to the intended Supabase project, uses a public browser key, or has the university configuration required by the product contract.

## Decision

Add an explicit deployment-readiness command that requires clean HTTPS origins for RoomScouter and hosted Supabase, accepts only Supabase publishable or legacy anonymous keys, and validates the university name and coordinate ranges. The command may report non-secret configuration but never prints the key.

The full release check runs this guard before tests, type checking, linting, and the production build. Deployment remains a human-approved operation, and hosted migrations stay separate from Vercel deployment. Local end-to-end tests continue using their independently guarded loopback configuration.

## Consequences

- Missing or unsafe production configuration stops the rehearsal before deployment.
- A service-role or secret key cannot be accidentally accepted as the browser key.
- Preview and production environments must each receive reviewed values.
- Passing the command does not replace hosted smoke testing, Supabase Auth configuration, or migration review.
