# 0020: Recover passwords through guarded PKCE sessions

## Status

Accepted

## Context

The deployed pilot supported registration and password login but offered no safe path when a user forgot a password. Manually editing authentication records or replacing an administrator account would bypass the product's normal identity lifecycle and create operational risk.

## Decision

Provide a public recovery-request page backed by Supabase Auth. Every syntactically valid request receives the same message regardless of account existence. Supabase sends a time-limited PKCE link to the canonical application callback, which accepts only the account and password-update destinations.

The password-update page requires a server-verified user from the exchanged recovery session. It validates matching 8-to-128-character values, delegates password storage to Supabase, globally signs out refresh-token sessions after success, and requires a fresh login.

Production callback construction prefers `ROOMSCOUTER_SITE_URL`; local development may use the valid request origin. The application never handles password hashes, secret keys, or recovery tokens outside Supabase's normal session exchange.

## Consequences

- Users can recover access without administrator intervention.
- The response does not reveal whether an email is registered.
- Email delivery and rate limits remain operational dependencies of hosted Supabase Auth.
- Recovery links must be opened in the browser that requested them when PKCE verifier state is stored there.
- Supabase Site URL and redirect allow-list configuration remain part of deployment rehearsal.
