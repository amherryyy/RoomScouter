# Engineering Workflow

This document adapts the portable engineering workflow audit to RoomScouter's existing Next.js, Supabase, and GitHub setup. The audit is retained at the repository root as a source/reference document; it is not runtime configuration.

## Project instructions and design records

- [AGENTS.md](../AGENTS.md) is the shared coding-agent entry point. Keep it concise and project-specific.
- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) defines the product, users, and pilot scope.
- [architecture.md](architecture.md) describes feature ownership, data boundaries, authorization, and testing strategy.
- [decisions](decisions/) records accepted decisions. Add a numbered decision record when a change materially changes a security boundary, data model, deployment process, or architectural direction.
- `.agents/skills/` contains project and selected specialist guidance. Read the applicable skill before Supabase work; read PostgreSQL best practices before database, SQL, policy, or migration changes. The specialist design, SEO, accessibility, and content skills are listed in the adoption map below.

## Local development and verification

Install from the committed lockfile and run the app with the commands in [README.md](../README.md). The repository's current checks are:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

`lint` currently aliases TypeScript checking. `npm run release:check` runs the deployment-readiness guard, tests, typecheck, lint, and build in sequence. It needs production-like configuration and is a rehearsal check, not a deployment command.

`npm run test:e2e:local` exercises browser journeys against the guarded loopback Supabase stack. It requires Docker Desktop, local Supabase, and the Playwright browser. Never point it at hosted data. The standard `npm test` uses ephemeral in-process PostgreSQL and does not need Docker or database credentials.

GitHub Actions runs `npm ci`, `npm audit --audit-level=high`, and the test, typecheck, lint, and production build checks for pull requests and pushes to `main`. This workflow is blocking as written. Repository branch protection and required status-check settings are managed in GitHub and are not asserted by the workflow file itself.

## Database and deployment boundaries

- Treat committed Supabase migrations as the schema history. Review migration impact, grants, RLS, storage policies, and generated types together.
- Test authorization as each relevant actor, including unauthenticated access and cross-user access. PostgreSQL is the final authorization boundary; server checks are an additional layer.
- Use only local/ephemeral targets for automated, state-changing validation. Do not run destructive reset or seed commands against hosted environments.
- Keep `.env.local`, service credentials, private customer data, and generated test artifacts out of commits.
- Hosted migrations, Auth configuration, and application deployment are separate reviewed operations. A passing build or `release:check` does not prove a hosted smoke test or migration is safe.

## Change and review expectations

Keep each change focused and preserve unrelated work. Check `git status` and the current branch before publishing, and stage only intended paths. Do not enable automatic commit/push helpers or broad staging hooks.

For behavior or boundary changes, update the relevant requirements, architecture notes, and/or decision record. Use the pull request template to describe the problem, result, checks actually run, and remaining deployment or verification work. Human verification should cover user-facing flows and any external or hosted effect that automated local checks cannot prove.

## Optional tooling policy

RoomScouter uses its existing npm scripts, GitHub Actions, and project skills as the workflow foundation. Add Git hooks, lifecycle hooks, native agent definitions, additional orchestrators, or third-party skills only for a concrete recurring need, with a narrowly scoped implementation and a demonstrated failure path. Never copy DannFlow-specific installers, remotes, task systems, secrets tooling, auto-commit behavior, or runtime databases into this project.

## Audit adoption map

The source audit's recommendations and inventories were reviewed against this repository. This is the disposition of its reusable parts:

| Audit area | RoomScouter disposition |
| --- | --- |
| Project context and architecture | Already present in `PROJECT_CONTEXT.md`, `docs/architecture.md`, requirements, and numbered decision records; referenced by `AGENTS.md`. |
| Agent entry point | Adapted in `AGENTS.md`, including this Next.js version's generated instruction block. |
| Skills | Keep the Supabase and PostgreSQL skills; added `roomscouter-engineering`. Selected design skills: `design-taste-frontend`, `redesign-existing-projects`. Blog/content skills: `site-architecture`, `content-strategy`, `copywriting`. Technical web quality skills: `seo`, `schema`, `accessibility`, `web-quality-audit`, `performance`, `core-web-vitals`, and `best-practices`. Use `docs/accessibility.md` and the existing tests as the RoomScouter baseline. |
| Quality commands and CI | Already present and blocking in `.github/workflows/ci.yml`; it uses Node 24, `npm ci`, `npm audit`, tests, typecheck, lint, and build. No replacement scripts or test framework from the source project were copied. |
| PR review | Added `.github/pull_request_template.md` for problem/result, validation, and review notes. |
| Git hooks | Deferred. There are no existing hook dependencies or formatting/lint-staged setup; CI already runs the full gate. Add local hooks only when a concrete fast staged-file check is configured and verified. |
| Lifecycle hooks and native agents | Deferred as optional host-specific configuration. The source audit found no-op handlers, ineffective/incorrect denial behavior, timeout-unit hazards, and stale agent/runtime claims. No source hook, bridge, or agent definition was copied. |
| GitHub, database, and browser tools | Keep the existing GitHub Actions and guarded local Supabase/Playwright workflows. Configure external MCP access only when a task needs it, with least privilege and an explicit project target. |
| Scaffolds, tasks, and tracking | Use the existing feature folders, requirements, architecture records, and acceptance criteria. No DannFlow masterplan, GitHub Project task lifecycle, prompt bridge, or generated scaffold system was introduced. |
| Ruflo, AgentDB, ReasoningBank, and swarm tooling | Omitted; these require separate runtimes and dependencies and do not improve the current app workflow by default. |
| Secrets and security checks | `.gitignore` excludes local environment files and CI runs `npm audit`. This does not itself provide repository secret scanning or prove GitHub secret-scanning/push-protection settings; those settings were not inspected. |
| Branch rules | CI runs for pull requests and `main` pushes. GitHub branch protection and required-check settings are external repository settings and remain unverified. |
| Product-specific catalogs and runtime state | Omitted JuanStack/DannFlow manifests, upstream remotes, auth URLs, machine memory, database state, and platform-specific scripts. |

The audit's appendices classify 136 skills (third-party, local, DannFlow-specific, runtime-bound, and prompt conversions), 197 command/reference files, 41 helpers, 18 role definitions, and environment-provided skills. Those are inventories of the source checkout, not an installation list. The selected skills above are copied under `.agents/skills/`, and `skills-lock.json` records their sources and content hashes. Their references resolve within the installed set. No application dependencies were added. The web-quality audit's included `analyze.sh` is a read-only Bash helper and is not the project's default Windows check; use browser evidence or platform-compatible tools when that skill applies.

The generic design skills contain opinionated defaults for other stacks and page types. Apply them as inspiration for marketing and editorial surfaces, not as a replacement design system for RoomScouter's search, listings, admin, or owner workflows. The marketing skills are written for commercial conversion goals; use RoomScouter's product context below and do not reuse their unsupported benchmark claims as facts.

The installer reported `content-strategy`, `seo`, and `best-practices` as Medium Risk in its Snyk panel (Gen: Safe; Socket: 0 alerts); skills with a reported lower Snyk rating were Low Risk. These are third-party instruction files, not application dependencies. Review their recommendations in context and prefer current authoritative sources for factual or technical claims.

`.agents/product-marketing.md` supplies the current audience, voice, and content guardrails expected by the installed content skills. Blog and SEO are prepared as future capabilities, not added to the Version 0.1 feature scope. Plan any blog storage/CMS, publishing workflow, URL changes, indexing rules, and redirects as a separate product and architecture decision.

The source audit also distinguishes files that exist from tools proven to run. Apply that standard here: documentation describes configured checks, and verification reports must name commands actually executed. The audit's generic husky, Vitest, ESLint, and `src/services` examples do not match this repository, so the workflow uses its existing Node test runner, TypeScript checks, Next.js build, and `src/features/` boundaries.
