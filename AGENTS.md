<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# RoomScouter engineering workflow

Product goals and constraints are in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). Read [docs/architecture.md](docs/architecture.md) and the relevant decision records before changing feature boundaries, authorization, deployment, or database behavior. Follow the matching project skill in `.agents/skills/` for Supabase and PostgreSQL work.

- Keep changes scoped and preserve unrelated work. Confirm the repository root and branch before publishing changes; stage explicit paths.
- Keep domain rules in `src/features/` and shared infrastructure in `src/lib/`. Keep authorization server-side and enforce it again with PostgreSQL grants, constraints, and RLS. Never expose a service-role or secret key to browser code.
- Validate untrusted input at the server boundary and use the generated database types. Never hand-edit `src/lib/supabase/database.types.ts`; regenerate it with `npm run types:database` after a migration.
- Before changing Next.js APIs or conventions, read the relevant guide under `node_modules/next/dist/docs/` as directed by the generated Next.js block above. Check installed CLI help before relying on Supabase CLI flags.
- For UI work, use `design-taste-frontend` for design direction and `redesign-existing-projects` for an audit-first refinement. The team's [UI handoff](docs/ui-handoff.md), existing CSS tokens, accessibility baseline, current framework, and requested scope take precedence over generic skill defaults; the app does not currently use Tailwind. Do not add a UI dependency just because a skill suggests it.
- For future blog work, use `site-architecture` to plan routes/navigation, `content-strategy` to choose useful topics, `copywriting` for drafts, `seo` for technical search checks, and `schema` only for accurate structured data. Use `web-quality-audit`, `accessibility`, `performance`, `core-web-vitals`, and `best-practices` for focused evidence-based audits.
- Imported design and marketing skills are advisory. Verify factual, legal, statistical, and search guidance against reliable current sources. Never invent testimonials, listing facts, dates, availability, statistics, search rankings, or performance results. Blog/SEO skills do not make those features part of current pilot scope.
- Run the relevant checks and report what actually ran, any failures, and what remains unverified. The standard checks are `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`; use `npm run release:check` for a full release rehearsal. The Playwright suite is `npm run test:e2e:local` and requires the guarded local Supabase stack.
- For larger work, define acceptance criteria before implementation. Review authorization, failure states, and accessibility for user-facing changes; consult `docs/accessibility.md` for UI work.
- Update requirements, architecture, or decision records when behavior or boundaries change. PRs should state the problem, result, validation, and operational or verification limits.
- Do not run hosted migrations, deploy, or change remote project settings as part of local implementation. Those are separate reviewed operations.

See [docs/engineering-workflow.md](docs/engineering-workflow.md) for the repository's development, verification, and review process.
