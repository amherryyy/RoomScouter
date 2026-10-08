---
name: roomscouter-engineering
description: Plan, implement, or review RoomScouter product changes using its feature boundaries, Supabase authorization model, accessibility guidance, and real verification commands.
---

# RoomScouter engineering workflow

Use this skill for feature work, architecture changes, and focused code review in this repository.

## Before changing code

- Read `PROJECT_CONTEXT.md` for product scope and the relevant sections of `docs/architecture.md` and `docs/decisions/` for existing boundaries.
- Inspect the current branch, working tree, relevant callers, and existing tests. Preserve unrelated edits and avoid staging unrelated files.
- For larger work, state observable acceptance criteria before implementation. Keep product behavior in `src/features/`; put genuinely cross-feature infrastructure in `src/lib/`.
- For Next.js API or convention changes, read the matching guide in `node_modules/next/dist/docs/` first.
- For Supabase work, follow `.agents/skills/supabase/SKILL.md`. Before database, SQL, migration, RLS, trigger, or index changes, also follow `.agents/skills/supabase-postgres-best-practices/SKILL.md`.
- For public content, read `.agents/product-marketing.md` and use only the specialist design, content, or SEO skills relevant to the request. Treat generic marketing claims and visual defaults as proposals; preserve RoomScouter's documented facts, stack, design direction, accessibility, and scope.

## Implementation and review

- Validate untrusted input at the server boundary. Enforce access on the server and again with PostgreSQL grants, constraints, and RLS. Check unauthenticated, wrong-role, and cross-user cases where relevant.
- Keep service-role and secret credentials out of browser code. Use generated database types; regenerate them with `npm run types:database` after schema changes.
- For user-facing changes, check keyboard use, labels, focus, feedback, responsive behavior, and semantic structure using `docs/accessibility.md` and its existing tests.
- Keep schema and behavior aligned: review migrations, policies, generated types, server actions, queries, and affected UI together. Do not point automated state-changing work at hosted Supabase.
- Update requirements, architecture notes, or a decision record when externally visible behavior or a durable boundary changes.
- Inspect the final diff for unintended files, credentials, missing error handling, authorization gaps, and claims that exceed the evidence.

## Verification and report

Choose checks that exercise the changed boundary. The normal repository commands are `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. `npm run release:check` adds the fail-closed deployment-readiness guard. `npm run test:e2e:local` requires the guarded loopback Supabase stack and Playwright browser.

State exactly which checks ran, their result, and what remains unverified. Local checks do not establish hosted migration safety, deployment success, remote Auth configuration, branch protection, or user acceptance.
