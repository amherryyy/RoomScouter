# Portable AI Engineering Workflow: JuanProperty/DannFlow Audit

Prepared 2026-10-08 from the JuanProperty-1 checkout. This is a read-only reverse-engineering report and installation guide for an independent project. P1.2 remains paused.

## What to take to another project

The useful core is small: project instructions, selected skills, quality commands, Git hooks, CI, a PR template, and product/architecture notes. Native subagents and lifecycle hooks are optional. Ruflo, AgentDB, swarm coordination, marketing packs, and DannFlow's masterplan system are not prerequisites.

| Layer | Purpose | Recommendation |
| --- | --- | --- |
| AGENTS.md | Codex project context, boundaries, commands, completion expectations | Essential; create a concise project-specific version |
| CLAUDE.md | Claude Code entry point | Add if Claude is used; point to shared rules |
| PROJECT_CONTEXT.md / architecture notes | Preserve decisions and module boundaries | Essential for nontrivial projects |
| Skills | Repeatable instructions and optional resources/scripts | Install selectively |
| Native subagents | Specialist workers with defined scope | Optional: explorer, implementer, reviewer |
| Lifecycle hooks | Scripts around tools/session events | Optional; test denials |
| Husky + lint-staged | Fast commit-time formatting/checks | Recommended for npm/Git |
| Lint/type/test/build | Machine-verifiable quality evidence | Essential, stack-appropriate |
| CI + branch rules | Enforce checks at PR merge | Essential for teams |
| Docs/verification notes | Record changed behavior and tests | Useful, keep light |
| GitHub/database/browser tools | Controlled external evidence | Install only if needed |
| Scaffold prompts | Predictable project structures | Adapt to the framework |
| Ruflo / Claude Flow | Optional swarms, memory, background workers | Advanced; unnecessary for ordinary Codex |
| AgentDB / ReasoningBank | Optional searchable agent memory | Only if project notes are insufficient |
| JuanStack manifests/namespaces | Vertical-specific application configuration | Omit from unrelated projects |

### Inventory counts

- 136 standard manifests in .agents/skills: 59 third-party skills with recorded source, 33 local workflow/runtime skills (including four DannFlow orchestrators), 44 source-command prompt conversions.
- 33 overlapping directories in .claude/skills; not 33 more distinct skills.
- 59 Claude skill link entries. Git tracks them as symlinks, but this Windows checkout materializes ordinary files containing relative targets.
- One additional legacy masterplan-task/index.md in each tree.
- 18 agent definitions: 17 Markdown and one browser YAML config. “87 agents” is a catalog claim, not 87 verified native agents.
- 197 command/reference Markdown files: 184 prompts and 13 README/index files.
- 41 helper files: 40 scripts/programs and one README.
- Three active Git hook entry points, one CI workflow, one Dependabot configuration, one PR template.
- Separate Codex/Claude lifecycle-hook configurations.
- 29 additional system/plugin skills available in this session outside the repository (Appendix E).

“Present” means the file exists; “configured” means another file references it. Neither proves it ran. I read the source/config but did not run initializers, background workers, auto-commit helpers, or production operations.

## Hooks and their real behavior

Three mechanisms are mixed together here: Git hooks, AI-host lifecycle hooks, and helper scripts. Only the first two run automatically when their host config is installed.

### Git hooks currently wired

Git's hooksPath is .husky/_. Husky runs scripts through sh -e.

| Hook | Actual behavior | Portability |
| --- | --- | --- |
| .husky/pre-commit | npx lint-staged | Reusable |
| package.json lint-staged | Formats staged JS/TS and fixes ESLint; formats JSON/CSS/Markdown | Match your files |
| .husky/commit-msg | Requires pending-doc ledger staged for most code/config; allows message exemptions | Adapt |
| .husky/pre-push | Runs lint + tsc; attempts to block main/master pushes if ledger has content | Adapt and repair |
| package.json prepare | Runs Husky after install | Reusable |

The commit-msg hook is not a Conventional Commit validator. It permits docs:, chore:, close:, [no-docs], “No docs needed”, and “no-docs-needed” to bypass its docs check. It excludes docs, public assets, scripts, README, .gitignore, and selected lockfiles from its trigger.

pre-push does not run production build or unit tests. Its docs check reads the current working tree, not all outgoing commits. GitHub merges do not run local pre-push hooks.

### Lifecycle events

.claude/settings.json configures these events; .codex/hooks.json carries a related subset.

| Event/matcher | Dispatched command | Actual local behavior |
| --- | --- | --- |
| PreToolUse / Bash | hook-handler.cjs pre-bash | Checks four hardcoded destructive-command substrings; attempts to reject with exit 1 |
| PreToolUse / Write, Edit, MultiEdit | pre-edit | No handler; prints generic success |
| PostToolUse / Write, Edit, MultiEdit | post-edit | Records metric and intelligence entry |
| PostToolUse / Bash | post-bash | No handler |
| UserPromptSubmit | route | Reads local intelligence context, suggests a role |
| SessionStart | session-restore | Restores/starts session state and initializes intelligence |
| SessionStart | auto-memory-hook.mjs import | Imports memory through bridge/fallback backend |
| SessionEnd (Claude only) | session-end | Consolidates intelligence and saves session |
| Stop | auto-memory-hook.mjs sync | Syncs memory through bridge/fallback backend |
| PreCompact / manual | compact-manual, then session-end | First has no handler; second saves state |
| PreCompact / auto | compact-auto, then session-end | First has no handler; second saves state |
| SubagentStart | status | No handler |
| SubagentStop | post-task | Records implicit success; does not run acceptance tests |
| Notification (Claude only) | notify | No handler |
| Claude statusLine | statusline.cjs | Shows Git/runtime metrics, not a quality gate |

hook-handler.cjs also implements pre-task and stats, not registered at the top level.

The router is a deterministic first-match regex table. It suggests coder, tester, reviewer, researcher, architect, backend-dev, frontend-dev, or devops. It does not spawn agents or verify matching prompts exist.

Current Codex supports project .codex/hooks.json and inline project hooks. Non-managed hooks require review/trust. The repo note saying Codex never runs hooks is outdated. The edit helper expects file_path, while Codex apply_patch input uses a patch command; matching event names does not ensure useful edit tracking. [Codex hooks reference](https://learn.chatgpt.com/docs/hooks)

The helper files named .claude/helpers/pre-commit and post-commit are not Husky's active hooks. Husky does not invoke them. The helper pre-commit suppresses some failures and may say tests were skipped or failed.

## Guardrails: instruction vs enforcement

| Rule | Implementation here | Porting guidance |
| --- | --- | --- |
| Check repository identity/remotes | AGENTS/CLAUDE instructions | Keep; replace DannFlow remotes |
| Preserve unrelated work | Prompts and commit instructions | Keep; stage explicit paths |
| UI/service boundary | Written rule + src/services | Keep where useful; lint-enforce imports |
| Generated types/no any | Instructions, Supabase types, TS strict | Keep; match actual lint rules |
| Auth/RLS/tenant isolation | Services, migrations, review prompts | Adapt; test unauthorized reads/writes |
| Migrations as schema truth | Supabase CLI workflow | Keep; choose target deliberately |
| No Docker/local DB | User constraint | Not universal |
| UI tokens/accessibility | Written design standards | Replace with actual design system |
| Feature blueprint first | Refers to src/prompts/features | Add real blueprints; directory absent here |
| Task IDs/GitHub Project | MASTERPLAN + Project workflow | Optional; use lightweight task list if simpler |
| Human verification | verify-task / close-task prompts | Useful for user-facing/external effects |
| Pending-doc ledger | Markdown + Git hooks | Repair empty-state parsing; enforce in CI |
| Docs/tracking commit sequence | close-task prompt | Optional team process |
| PR quality | Pull request template | Reuse problem/result/validation/limits |
| CI before merge | Workflow; branch rules not inspected | Require passing job in GitHub settings |
| Secret protection | .gitignore + Claude read deny | Add actual scanning and runtime permissions |
| Vertical module ownership | JuanStack manifests | Omit unless truly needed |
| Domain words from config | getTerm/useTerm | Omit for conventional product |
| DannFlow upstream sync | Specialized commands/remotes | Omit from independent repo |

The phase-1 PR target discussed earlier is project-specific; set the other project's actual base branch.

### Findings before copying

1. Six configured helper commands are no-ops: pre-edit, post-bash, compact-manual, compact-auto, status, notify.
2. The command safety hook exits 1 without a structured deny. Claude uses exit 2 or a valid decision object to block PreToolUse; exit 1 alone normally does not block. Four substrings are not a shell security boundary. [Claude hook exit behavior](https://code.claude.com/docs/en/hooks)
3. Configured timeouts look like milliseconds but Codex interprets them as seconds. 5000 means 5000 seconds. The handler has a separate 5-second timer, not a fix for the outer values.
4. Husky launches scripts via sh, but pre-push uses Bash [[ ... ]]. Rewrite with POSIX syntax or tested Node.
5. The ledger has ordinary prose claiming no pending entries. The parser treats this prose as pending and may block main pushes.
6. CI lint has continue-on-error: true. It builds but does not run Vitest: not a strict lint/test gate.
7. “No any” prose exceeds ESLint enforcement; some UI/chat/hooks paths turn off no-explicit-any and other checks.
8. Claude skill mirrors are not functioning Windows symlinks here; reinstall/copy them with a supported installer.
9. The 87-agent and 15-worker claims are catalog/config values, not verified running agents. Some definitions contain legacy runtime fields/hooks.
10. Optional auto-commit defaults AUTO_PUSH=true and may git add -A. standard-checkpoint-hooks.sh also stages all files. Do not activate unchanged.
11. github-safe.js moves body text to a temp file but still joins arguments into a shell command. Use execFile/spawn with shell:false.
12. Security scanner skips npm audit, returns zero for it, and writes CVE counts as constants. Its “clean” output is not security evidence.
13. Some helper imports (sql.js, AgentDB, agentic-flow, @claude-flow) are not declared package dependencies.
14. ruvector.db is tracked while .gitignore excludes @ruvector.db. Do not copy session DB. This audit did not inspect its contents.
15. Config assumes Homebrew paths, Darwin/ARM64, Bash/jq, and sometimes a v3/ tree.
16. “Codex-flow” prompt conversions do not install a runtime or tools.
17. install.sh clones/rebrands DannFlow and resets cloned Git history; it is not an add-on installer. guide.sh references a missing install-add.sh.
18. Config does not prove services run. Committed security status is PENDING with no scan timestamp. No workers/scans were run.

## Install the portable core in another project

These are instructions for that project; none were executed. Keep its existing application, Git history, package manager, and framework. In PowerShell use npm.cmd/npx.cmd if execution policy blocks npm wrappers.

### A. Minimal layout

~~~text
your-project/
  AGENTS.md
  CLAUDE.md                       # optional Claude entry point
  PROJECT_CONTEXT.md
  TASKS.md                        # optional task list
  .agents/skills/
  .codex/agents/                  # optional native Codex agent TOML
  .codex/hooks.json               # optional trusted hooks
  .claude/agents/                 # optional native Claude agents
  .claude/skills/
  .claude/settings.json
  .husky/pre-commit
  .husky/pre-push
  .github/workflows/ci.yml
  .github/pull_request_template.md
  docs/architecture.md
  docs/decisions/
  docs/tests/
  docs/PENDING_DOC_UPDATES.md
  scripts/
~~~

Start with AGENTS.md, project context, real quality commands, and CI. Add optional folders only when needed.

Portable AGENTS.md starter:

~~~md
# Project instructions

Product goals and constraints are in PROJECT_CONTEXT.md.
Use docs/architecture.md for module boundary changes.

Keep changes scoped and preserve unrelated work.
Verify repository root and branch before publishing.
Keep UI separate from business logic; enforce authorization server-side.
Use project types and validate untrusted inputs.
Never commit credentials or private customer data.

Run the relevant lint, typecheck, tests, and build.
Report checks actually run, failures, and verification still pending.
Update docs when behavior or architecture changes.

For larger tasks, define acceptance criteria before coding.
Delegate independent work only with clear file ownership.
Stage explicit paths. PRs explain problem, result, validation, and limits.
~~~

### B. Git checks

For an existing npm/Git project:

~~~powershell
npm install --save-dev husky lint-staged prettier
npx husky init
~~~

Merge with existing scripts/hooks instead of overwriting them. Husky init creates prepare and a starter pre-commit hook. [Husky setup](https://typicode.github.io/husky/get-started.html)

Merge appropriate real scripts into package.json, preserving its existing build command:

~~~json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "YOUR_EXISTING_BUILD_COMMAND"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
~~~

Vitest is only an example. Substitute the actual runner or omit until configured.

.husky/pre-commit:

~~~sh
npx lint-staged
~~~

.husky/pre-push:

~~~sh
npm run lint
npm run typecheck
npm test
~~~

Run the full build in CI; optionally pre-push. In a disposable test repo, verify a deliberate check failure returns nonzero. Local hooks can be bypassed, so enforce important checks in CI/branch rules. [Husky hook behavior](https://typicode.github.io/husky/how-to.html)

### C. Skills

Codex searches .agents/skills/<skill>/SKILL.md. Copy the full folder including references/scripts/assets. Host discovery metadata does not install referenced executables. [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills)

The open skills CLI supports:

~~~powershell
npx skills add OWNER/REPOSITORY --list
npx skills add OWNER/REPOSITORY --skill SKILL_NAME --agent codex --copy
~~~

For Claude, target --agent claude-code. --copy avoids Windows symlink reliance. [Skills CLI options](https://github.com/vercel-labs/skills)

| ID | Third-party source | Skills |
| --- | --- | --- |
| S1 | alirezarezvani/claude-skills | a11y-audit |
| S2 | coreyhaines31/marketingskills | 41 growth/marketing skills; choose names in Appendix A |
| S3 | Leonxlnx/taste-skill | 12 visual design skills |
| S4 | anthropics/skills | claude-api |
| S5 | emilkowalski/skill | emil-design-eng |
| S6 | pbakaus/impeccable | impeccable |
| S7 | addyosmani/web-quality-skills | seo |
| S8 | shadcn/ui | shadcn |

Examples:

~~~powershell
npx skills add alirezarezvani/claude-skills --skill a11y-audit --agent codex --copy
npx skills add pbakaus/impeccable --skill impeccable --agent codex --copy
npx skills add shadcn/ui --skill shadcn --agent codex --copy
~~~

For local skills, copy and adapt one directory. Fail when the target exists:

~~~powershell
$sourceRepo = 'C:\Users\Ahmer\RSProject\JuanProperty-1'
$targetRepo = 'C:\path\to\your-other-project'
$skillName = 'source-command-review'
$skillRoot = Join-Path $targetRepo '.agents\skills'
$skillTarget = Join-Path $skillRoot $skillName

if (!(Test-Path -LiteralPath $targetRepo -PathType Container)) {
    throw 'Target project does not exist.'
}
if (Test-Path -LiteralPath $skillTarget) {
    throw 'Skill already exists; compare and merge manually.'
}
New-Item -ItemType Directory -Path $skillRoot -Force | Out-Null
$sourceSkill = Join-Path (Join-Path $sourceRepo '.agents\skills') $skillName
Copy-Item -LiteralPath $sourceSkill -Destination $skillRoot -Recurse
~~~

Update its framework paths, checks, types, DB, tracker, and required tools. Codex-only projects do not need Claude commands/bridge.

Suggested start: review, security checklist, one design skill (if UI), accessibility (if web), relevant framework guidance. Marketing pack is not an engineering requirement.

### D. Native subagents

Start with explorer, implementer, reviewer/tester. Specify task boundary, expected output, permitted tools, and owned files. Avoid concurrent edits to the same file.

Codex .codex/agents/reviewer.toml example:

~~~toml
name = "reviewer"
description = "Review a diff for correctness, authorization, and missing tests."
sandbox_mode = "read-only"
developer_instructions = """
Inspect the diff and relevant callers.
Report concrete findings with file references and reproduction conditions.
Do not edit files. Separate verified findings from uncertain concerns.
"""
~~~

Native Codex custom agents require name, description, developer_instructions; model is optional. [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)

Claude .claude/agents/reviewer.md example:

~~~md
---
name: reviewer
description: Review code for correctness, authorization, and missing tests.
tools: Read, Grep, Glob
---
Inspect the supplied diff and relevant source.
Return concrete findings. Do not edit or publish comments.
~~~

Inspect with Claude's /agents. Adapt role prompts; do not copy legacy frontmatter hooks. [Claude subagents](https://code.claude.com/docs/en/sub-agents)

### E. Lifecycle hooks

Start with one narrow session-context or policy hook. Test allow, deny, malformed input, and missing dependency.

Codex uses .codex/hooks.json or inline .codex/config.toml; review/trust hooks with /hooks. Timeouts use seconds; use project-root paths and Windows-specific command variants. [Codex hooks](https://learn.chatgpt.com/docs/hooks)

Claude uses .claude/settings.json. Use PreToolUse to check before an action; exit 2 or valid structured deny blocks. PostToolUse is too late to prevent it. [Claude hooks](https://code.claude.com/docs/en/hooks)

Good uses: small project context at session start; specific protected-operation check; bounded audit record; refresh before compaction. Keep lint/format in Git hooks. Avoid auto-commit, auto-push, broad rollback, and invented security scores.

### F. CI and PR

Make intended CI gates blocking: checkout, matching Node version, locked install, lint, typecheck, tests, build, required GitHub status check. Current repo's lint can fail without failing CI, and tests are not run.

PR template:

~~~md
## Problem and result

What was missing, and what works now?

## Validation

Commands and user flows tested; include what remains unverified.

## Review notes

Deployment/migration needs, behavior changes, and follow-up limits.
~~~

Dependabot here checks npm and GitHub Actions weekly; keep it when useful and review compatibility.

### G. MCP and tools

Codex terminal/file tools cover local code/checks. Since you already use Codex, no additional general coding orchestrator is required.

| Tool | Use | Setup |
| --- | --- | --- |
| GitHub connector/MCP | Repository/PR/issue/CI evidence | Reuse connected app or configure official server |
| gh CLI | PR/Projects tasks missing from connector | Install CLI, authenticate, grant least privilege |
| DB MCP | Live schema/advisors | Scope to chosen project |
| Browser integration | Reproduce UI/runtime behavior | Use current browser integration/test runner |
| Official docs | Version-specific API details | Use vendor docs |
| Ruflo MCP | Optional memory/swarm | Separate runtime and host setup |

GitHub Codex PAT config:

~~~toml
[mcp_servers.github]
url = "https://api.githubcopilot.com/mcp/"
bearer_token_env_var = "GITHUB_PAT_TOKEN"
~~~

Keep the token in the launching environment/secret manager, never tracked config. [Official GitHub MCP Codex setup](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-codex.md)

For Supabase diagnostics, use project_ref and read_only=true; schema changes still belong in tracked migrations. [Supabase MCP guide](https://supabase.com/docs/guides/ai-tools/mcp)

mcp.example.json uses Homebrew paths and legacy shape; do not copy as-is or connect to JuanProperty.

### H. Optional Ruflo/AgentDB

Current Ruflo install guide lists:

~~~powershell
npx ruflo@latest init wizard
npx ruflo@latest doctor
~~~

Claude registration:

~~~powershell
claude mcp add ruflo -- npx ruflo@latest mcp start
~~~

Initialization writes configuration: try an experimental branch/disposable copy, then pin/review versions for a team. [Ruflo installation](https://github.com/ruvnet/ruflo/wiki/Installation)

Old claude-flow@v3alpha, @claude-flow/cli, agentic-flow@alpha, and “Codex-flow” prompt conversions are not interchangeable runtimes. AgentDB/ReasoningBank skills do not install the libraries.

## Scaffolding and lifecycle

| Repo component | Purpose here | Other project |
| --- | --- | --- |
| new-feature prompt | Service/types/App Router/form scaffolding | Adapt to framework |
| new-page prompt | App Router page/loading/error/Card | Adapt route pattern |
| src/services | Data/business logic boundary | Service/use-case layer if useful |
| src/types | Generated database types/contracts | Generate schema types |
| src/lib/validation | Boundary schemas/tests | Validate inputs |
| src/components/ui | Shadcn primitives | Keep your UI library |
| src/utils/supabase | DB client boundary | Use your backend adapter |
| supabase/migrations | Versioned schema/RLS | Keep migration files |
| docs/tests | Verification evidence | Record concise acceptance evidence |
| docs/diagrams | Architecture diagrams | Optional |
| inspirations | Ignored reference code/assets | Optional; review reuse/license |
| business.json/manifests | JuanStack vertical configuration | Omit unless product needs it |

Scaffold commands are prompts, not deterministic CLI tools. They reference Ruflo memory and sometimes delegated agents; neither is inherently required.

The app's src/hooks are React hooks (use-artifact, use-active-chat, use-auto-resume, use-messages, use-chat-visibility, use-mobile, use-scroll-to-bottom), not AI lifecycle or Git hooks.

Daily workflow: define acceptance criteria; inspect code/status; make a focused branch change; run relevant checks; review auth/edge cases; update docs; commit scoped files; rely on required CI/review. Larger projects can use task IDs/boards; small projects rarely need onboarding interviews, 15-worker swarms, or three commits per routine change.

## Leave behind

DannFlow installer/adoption/upstream sync, dannflow.json, JuanProperty context/IDs/cards, business.json/persona manifests, database rows, real auth URLs, machine memory, platform-specific paths, blanket marketing packs, unverified performance/truth-score claims, auto-push/rollback helpers, and application dependencies the new product does not use.

## Acceptance checklist

- Agent understands architecture and real check commands.
- Skills show up in host discovery and references resolve.
- Native reviewer is discoverable and read-only.
- Commit hook runs; a deliberately failing check blocks.
- CI gates lint/typecheck/tests/build and branch rules require it.
- Policy hooks handle allow/deny/malformed/missing-dependency cases.
- No secrets, DB data, runtime memory, or JuanProperty context copied.
- Documentation describes only observed test results.
- Workflow remains useful without Ruflo.

## Inventory legend

S1–S8: source IDs in the third-party table. L: local skill; copy/adapt. D: DannFlow-specific; omit/rewrite. R: runtime-specific; install runtime separately. P: prompt/command; adapt into native skill/command. A: role prompt; adapt to native agent format.



# Appendix A — All 136 project skill manifests

Descriptions are from the local SKILL.md metadata (some are long activation instructions). S1–S8 are source recipes in the install guide. L means local and requires adaptation. D means DannFlow/JuanStack-specific. R means an optional runtime/tooling specialization.

| Skill | Description from manifest | Source | Port |
| --- | --- | --- | --- |
| a11y-audit | Accessibility audit skill for scanning, fixing, and verifying WCAG 2.2 Level A and AA compliance across React, Next.js, Vue, Angular, Svelte, and plain HTML codebases. Use when auditing accessibility, fixing a11y violations, checking color contrast, generating compliance reports, or integrating accessibility checks into CI/CD pipelines. | alirezarezvani/claude-skills | S1 |
| ab-testing | When the user wants to plan, design, or implement an A/B test or experiment, or build a growth experimentation program. Also use when the user mentions "A/B test," "split test," "experiment," "test this change," "variant copy," "multivariate test," "hypothesis," "should I test this," "which version is better," "test two versions," "statistical significance," "how long should I run this test," "growth experiments," "experiment velocity," "experiment backlog," "ICE score," "experimentation program," or "experiment playbook." Use this whenever someone is comparing two approaches and wants to measure which performs better, or when they want to build a systematic experimentation practice. For tracking implementation, see analytics. For page-level conversion optimization, see cro. | coreyhaines31/marketingskills | S2 |
| ad-creative | When the user wants to generate, iterate, or scale ad creative — headlines, descriptions, primary text, or full ad variations — for any paid advertising platform. Also use when the user mentions 'ad copy variations,' 'ad creative,' 'generate headlines,' 'RSA headlines,' 'bulk ad copy,' 'ad iterations,' 'creative testing,' 'ad performance optimization,' 'write me some ads,' 'Facebook ad copy,' 'Google ad headlines,' 'LinkedIn ad text,' or 'I need more ad variations.' Use this whenever someone needs to produce ad copy at scale or iterate on existing ads. For campaign strategy and targeting, see ads. For landing page copy, see copywriting. | coreyhaines31/marketingskills | S2 |
| ads | When the user wants help with paid advertising campaigns on Google Ads, Meta (Facebook/Instagram), LinkedIn, Twitter/X, or other ad platforms. Also use when the user mentions 'PPC,' 'paid media,' 'ROAS,' 'CPA,' 'ad campaign,' 'retargeting,' 'audience targeting,' 'Google Ads,' 'Facebook ads,' 'LinkedIn ads,' 'ad budget,' 'cost per click,' 'ad spend,' or 'should I run ads.' Use this for campaign strategy, audience targeting, bidding, and optimization. For bulk ad creative generation and iteration, see ad-creative. For landing page optimization, see cro. | coreyhaines31/marketingskills | S2 |
| agentdb-advanced | Master advanced AgentDB features including QUIC synchronization, multi-database management, custom distance metrics, hybrid search, and distributed systems integration. Use when building distributed AI systems, multi-agent coordination, or advanced vector search applications. | Local | R |
| agentdb-learning | Create and train AI learning plugins with AgentDB's 9 reinforcement learning algorithms. Includes Decision Transformer, Q-Learning, SARSA, Actor-Critic, and more. Use when building self-learning agents, implementing RL, or optimizing agent behavior through experience. | Local | R |
| agentdb-memory-patterns | Implement persistent memory patterns for AI agents using AgentDB. Includes session memory, long-term storage, pattern learning, and context management. Use when building stateful agents, chat systems, or intelligent assistants. | Local | R |
| agentdb-optimization | Optimize AgentDB performance with quantization (4-32x memory reduction), HNSW indexing (150x faster search), caching, and batch operations. Use when optimizing memory usage, improving search speed, or scaling to millions of vectors. | Local | R |
| agentdb-vector-search | Implement semantic vector search with AgentDB for intelligent document retrieval, similarity matching, and context-aware querying. Use when building RAG systems, semantic search engines, or intelligent knowledge bases. | Local | R |
| ai-seo | When the user wants to optimize content for AI search engines, get cited by LLMs, or appear in AI-generated answers. Also use when the user mentions 'AI SEO,' 'AEO,' 'GEO,' 'LLMO,' 'answer engine optimization,' 'generative engine optimization,' 'LLM optimization,' 'AI Overviews,' 'optimize for ChatGPT,' 'optimize for Perplexity,' 'AI citations,' 'AI visibility,' 'zero-click search,' 'how do I show up in AI answers,' 'LLM mentions,' or 'optimize for Claude/Gemini.' Use this whenever someone wants their content to be cited or surfaced by AI assistants and AI search engines. For traditional technical and on-page SEO audits, see seo-audit. For structured data implementation, see schema. | coreyhaines31/marketingskills | S2 |
| analytics | When the user wants to set up, improve, or audit analytics tracking and measurement. Also use when the user mentions "set up tracking," "GA4," "Google Analytics," "conversion tracking," "event tracking," "UTM parameters," "tag manager," "GTM," "analytics implementation," "tracking plan," "how do I measure this," "track conversions," "attribution," "Mixpanel," "Segment," "are my events firing," or "analytics isn't working." Use this whenever someone asks how to know if something is working or wants to measure marketing results. For A/B test measurement, see ab-testing. | coreyhaines31/marketingskills | S2 |
| aso | When the user wants to audit or optimize an App Store or Google Play listing. Also use when the user mentions 'ASO audit,' 'app store optimization,' 'optimize my app listing,' 'improve app visibility,' 'app store ranking,' 'audit my listing,' 'why aren't people downloading my app,' 'improve my app conversion,' 'keyword optimization for app,' or 'compare my app to competitors.' Use when the user shares an App Store or Google Play URL and wants to improve it. | coreyhaines31/marketingskills | S2 |
| brandkit | Premium brand-kit image generation skill for creating high-end brand-guidelines boards, logo systems, identity decks, and visual-world presentations. Trained for minimalist, cinematic, editorial, dark-tech, luxury, cultural, security, gaming, developer-tool, and consumer-app brand systems. Optimized for intentional logo concepting, refined composition, sparse typography, strong symbolic meaning, premium mockups, art-directed imagery, and flexible grid layouts. | Leonxlnx/taste-skill | S3 |
| browser | Web browser automation with AI-optimized snapshots for Codex-flow agents | Local | L |
| churn-prevention | When the user wants to reduce churn, build cancellation flows, set up save offers, recover failed payments, or implement retention strategies. Also use when the user mentions 'churn,' 'cancel flow,' 'offboarding,' 'save offer,' 'dunning,' 'failed payment recovery,' 'win-back,' 'retention,' 'exit survey,' 'pause subscription,' 'involuntary churn,' 'people keep canceling,' 'churn rate is too high,' 'how do I keep users,' or 'customers are leaving.' Use this whenever someone is losing subscribers or wants to build systems to prevent it. For post-cancel win-back email sequences, see emails. For in-app upgrade paywalls, see paywalls. | coreyhaines31/marketingskills | S2 |
| claude-api | Build, debug, and optimize Claude API / Anthropic SDK apps. Apps built with this skill should include prompt caching. Also handles migrating existing Claude API code between Claude model versions (4.5 → 4.6, 4.6 → 4.7, retired-model replacements). TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`; user asks for the Claude API, Anthropic SDK, or Managed Agents; user adds/modifies/tunes a Claude feature (caching, thinking, compaction, tool use, batch, files, citations, memory) or model (Opus/Sonnet/Haiku) in a file; questions about prompt caching / cache hit rate in an Anthropic SDK project. SKIP: file imports `openai`/other-provider SDK, filename like `*-openai.py`/`*-generic.py`, provider-neutral code, general programming/ML. | anthropics/skills | S4 |
| co-marketing | When the user wants to find co-marketing partners, plan joint campaigns, or brainstorm partnership opportunities. Use when the user says 'co-marketing,' 'partner marketing,' 'joint campaign,' 'who should we partner with,' 'integration marketing,' 'cross-promotion,' 'collaborate with another company,' 'partnership ideas,' or 'co-brand.' For customer referral programs, see referrals. For launch-specific partnerships, see launch. | coreyhaines31/marketingskills | S2 |
| cold-email | Write B2B cold emails and follow-up sequences that get replies. Use when the user wants to write cold outreach emails, prospecting emails, cold email campaigns, sales development emails, or SDR emails. Also use when the user mentions "cold outreach," "prospecting email," "outbound email," "email to leads," "reach out to prospects," "sales email," "follow-up email sequence," "nobody's replying to my emails," or "how do I write a cold email." Covers subject lines, opening lines, body copy, CTAs, personalization, and multi-touch follow-up sequences. For warm/lifecycle email sequences, see emails. For sales collateral beyond emails, see sales-enablement. | coreyhaines31/marketingskills | S2 |
| community-marketing | Build and leverage online communities to drive product growth and brand loyalty. Use when the user wants to create a community strategy, grow a Discord or Slack community, manage a forum or subreddit, build brand advocates, increase word-of-mouth, drive community-led growth, engage users post-signup, or turn customers into evangelists. Trigger phrases: \"build a community,\" \"community strategy,\" \"Discord community,\" \"Slack community,\" \"community-led growth,\" \"brand advocates,\" \"user community,\" \"forum strategy,\" \"community engagement,\" \"grow our community,\" \"ambassador program,\" \"community flywheel.\" | coreyhaines31/marketingskills | S2 |
| competitor-profiling | When the user wants to research, profile, or analyze competitors from their URLs. Also use when the user mentions 'competitor profile,' 'competitor research,' 'competitor analysis,' 'profile this competitor,' 'analyze competitor,' 'competitive intelligence,' 'competitor deep dive,' 'who are my competitors,' 'competitor landscape,' 'competitor dossier,' 'competitive audit,' or 'research these competitors.' Input is a list of competitor URLs. Output is structured competitor profile markdown files. For creating comparison/alternative pages from profiles, see competitors. For sales-specific battle cards, see sales-enablement. | coreyhaines31/marketingskills | S2 |
| competitors | When the user wants to create competitor comparison or alternative pages for SEO and sales enablement. Also use when the user mentions 'alternative page,' 'vs page,' 'competitor comparison,' 'comparison page,' '[Product] vs [Product],' '[Product] alternative,' 'competitive landing pages,' 'how do we compare to X,' 'battle card,' or 'competitor teardown.' Use this for any content that positions your product against competitors. Covers four formats: singular alternative, plural alternatives, you vs competitor, and competitor vs competitor. For sales-specific competitor docs, see sales-enablement. | coreyhaines31/marketingskills | S2 |
| content-strategy | When the user wants to plan a content strategy, decide what content to create, or figure out what topics to cover. Also use when the user mentions "content strategy," "what should I write about," "content ideas," "blog strategy," "topic clusters," "content planning," "editorial calendar," "content marketing," "content roadmap," "what content should I create," "blog topics," "content pillars," or "I don't know what to write." Use this whenever someone needs help deciding what content to produce, not just writing it. For writing individual pieces, see copywriting. For SEO-specific audits, see seo-audit. For social media content specifically, see social. | coreyhaines31/marketingskills | S2 |
| copy-editing | When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. For writing new copy, see copywriting. | coreyhaines31/marketingskills | S2 |
| copywriting | When the user wants to write, rewrite, or improve marketing copy for any page — including homepage, landing pages, pricing pages, feature pages, about pages, or product pages. Also use when the user says "write copy for," "improve this copy," "rewrite this page," "marketing copy," "headline help," "CTA copy," "value proposition," "tagline," "subheadline," "hero section copy," "above the fold," "this copy is weak," "make this more compelling," or "help me describe my product." Use this whenever someone is working on website text that needs to persuade or convert. For email copy, see emails. For popup copy, see popups. For editing existing copy, see copy-editing. | coreyhaines31/marketingskills | S2 |
| cro | When the user wants to optimize, improve, or increase conversions on any marketing page or form — including homepage, landing pages, pricing pages, feature pages, lead capture forms, or contact forms. Also use when the user says 'CRO,' 'conversion rate optimization,' 'this page isn't converting,' 'improve conversions,' 'why isn't this page working,' 'my landing page sucks,' 'form abandonment,' 'nobody's converting,' 'low conversion rate,' or 'this page needs work.' Use this even if the user just shares a URL and asks for feedback. For signup/registration flows, see signup. For post-signup activation, see onboarding. For popups/modals, see popups. | coreyhaines31/marketingskills | S2 |
| customer-research | When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions "customer research," "ICP research," "talk to customers," "analyze transcripts," "customer interviews," "survey analysis," "support ticket analysis," "voice of customer," "VOC," "build personas," "customer personas," "jobs to be done," "JTBD," "what do customers say," "what are customers struggling with," "Reddit mining," "G2 reviews," "review mining," "digital watering holes," "community research," "forum research," "competitor reviews," "customer sentiment," or "find out why customers churn/convert/buy." Use for both analyzing existing research assets AND gathering new research from online sources. For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro. | coreyhaines31/marketingskills | S2 |
| dannflow-juanstack-init | Interactive interview and setup orchestrator for initializing new JuanStack vertical SaaS projects. Configures business.json, PROJECT_CONTEXT.md, AI personas manifest, BIR compliance rules, and namespace paths. | Local | D |
| dannflow-masterplan | SaaS onboarding, Phase 0 readiness, Masterplan generation, and GitHub Project sync orchestrator for DannFlow. Use when asked to 'start a new project', 'initialize masterplan', 'plan next phase', 'sync github board', or configure foundational infrastructure (Supabase, Auth, Vercel). | Local | D |
| dannflow-task | Autonomous task lifecycle manager for DannFlow. Use when asked to 'do task Px.x', 'execute a task', or whenever you are given a specific task from the MASTERPLAN to complete end-to-end. Orchestrates masterplan reading, GitHub syncing, coding, pre-verification quality gates, human verification loops, and clean closing. | Local | D |
| dannflow-update | Conversational, highly granular agent for updating old/legacy DannFlow repositories (like those using Drizzle) from the upstream DannFlow template. Use when asked to 'run the dannflow-update agent', 'sync from upstream', or 'update this old repo'. | Local | D |
| design-taste-frontend | Senior UI/UX Engineer. Architect digital interfaces overriding default LLM biases. Enforces metric-based rules, strict component architecture, CSS hardware acceleration, and balanced design engineering. | Leonxlnx/taste-skill | S3 |
| directory-submissions | When the user wants to submit their product to startup, SaaS, AI, agent, MCP, no-code, or review directories for backlinks, domain rating, and discovery. Also use when the user mentions "directory submissions," "submit to directories," "backlinks from directories," "list my product," "submit to Product Hunt," "BetaList," "TAAFT," "Futurepedia," "G2 listing," "Capterra listing," "AlternativeTo," "SaaSHub," "AI directories," "MCP registry," "agent directory," "dofollow backlinks," "launch directories," or "directory tracker." Use this whenever someone is planning the directory layer of a product launch or an ongoing backlink campaign. For the broader launch moment, see launch. For programmatic SEO pages that should live behind these backlinks, see programmatic-seo. For AI citation optimization, see ai-seo. | coreyhaines31/marketingskills | S2 |
| emails | When the user wants to create or optimize an email sequence, drip campaign, automated email flow, or lifecycle email program. Also use when the user mentions "email sequence," "drip campaign," "nurture sequence," "onboarding emails," "welcome sequence," "re-engagement emails," "email automation," "lifecycle emails," "trigger-based emails," "email funnel," "email workflow," "what emails should I send," "welcome series," or "email cadence." Use this for any multi-email automated flow. For cold outreach emails, see cold-email. For in-app onboarding, see onboarding. | coreyhaines31/marketingskills | S2 |
| emil-design-eng | This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. | emilkowalski/skill | S5 |
| free-tools | When the user wants to plan, evaluate, or build a free tool for marketing purposes — lead generation, SEO value, or brand awareness. Also use when the user mentions "engineering as marketing," "free tool," "marketing tool," "calculator," "generator," "interactive tool," "lead gen tool," "build a tool for leads," "free resource," "ROI calculator," "grader tool," "audit tool," "should I build a free tool," or "tools for lead gen." Use this whenever someone wants to build something useful and give it away to attract leads or earn links. For downloadable content lead magnets (ebooks, checklists, templates), see lead-magnets. | coreyhaines31/marketingskills | S2 |
| full-output-enforcement | Overrides default LLM truncation behavior. Enforces complete code generation, bans placeholder patterns, and handles token-limit splits cleanly. Apply to any task requiring exhaustive, unabridged output. | Leonxlnx/taste-skill | S3 |
| github-code-review | Comprehensive GitHub code review with AI-powered swarm coordination | Local | L |
| github-multi-repo | Multi-repository coordination, synchronization, and architecture management with AI swarm orchestration | Local | L |
| github-project-management | Comprehensive GitHub project management with swarm-coordinated issue tracking, project board automation, and sprint planning | Local | L |
| github-release-management | Comprehensive GitHub release orchestration with AI swarm coordination for automated versioning, testing, deployment, and rollback management | Local | L |
| github-workflow-automation | Advanced GitHub Actions workflow automation with AI swarm coordination, intelligent CI/CD pipelines, and comprehensive repository management | Local | L |
| gpt-taste | Elite UX/UI & Advanced GSAP Motion Engineer. Enforces Python-driven true randomization for layout variance, strict AIDA page structure, wide editorial typography (bans 6-line wraps), gapless bento grids, strict GSAP ScrollTriggers (pinning, stacking, scrubbing), inline micro-images, and massive section spacing. | Leonxlnx/taste-skill | S3 |
| high-end-visual-design | Teaches the AI to design like a high-end agency. Defines the exact fonts, spacing, shadows, card structures, and animations that make a website feel expensive. Blocks all the common defaults that make AI designs look cheap or generic. | Leonxlnx/taste-skill | S3 |
| hooks-automation | Automated coordination, formatting, and learning from Codex operations using intelligent hooks with MCP integration. Includes pre/post task hooks, session management, Git integration, memory coordination, and neural pattern training for enhanced development workflows. | Local | R |
| image | When the user wants to create, generate, edit, or optimize images for marketing — blog heroes, social graphics, product mockups, profile banners, listing visuals, or brand assets. Also use when the user mentions 'AI image generation,' 'generate an image,' 'create a graphic,' 'product mockup,' 'hero image,' 'social media graphic,' 'banner image,' 'cover photo,' 'profile banner,' 'listing screenshot,' 'Flux,' 'Flux Kontext,' 'Midjourney,' 'DALL-E,' 'GPT Image,' 'ChatGPT Images,' 'Ideogram,' 'Gemini image,' 'Nano Banana,' 'Recraft,' 'Stable Diffusion,' 'Canva,' 'Figma,' 'image optimization,' 'compress images,' 'WebP,' or 'OG image.' Use this for general-purpose marketing image creation and optimization. For paid ad image creative and platform-specific ad specs, see ad-creative. For video production, see video. | coreyhaines31/marketingskills | S2 |
| image-to-code | Elite website image-to-code skill for Codex. For visually important web tasks, it must first generate the design image(s) itself, deeply analyze them, then implement the website to match them as closely as possible. In Codex, it must prefer large, readable, section-specific images instead of tiny compressed boards, generate fresh standalone images for sections or detail views instead of cropping old ones, avoid lazy under-generation, avoid cards-inside-cards-inside-cards UI, and keep the hero clean, spacious, readable, and visible on a small laptop. | Leonxlnx/taste-skill | S3 |
| imagegen-frontend-mobile | Elite mobile app image-generation skill for creating premium, app-native screen concepts and flows. Designed for iOS, Android, and cross-platform mobile products. Prioritizes clean hierarchy, comfortably readable text, strong multi-screen consistency, controlled color palettes, non-generic creative direction, textured surfaces, image-led composition, tasteful custom iconography, and clean phone mockup framing. By default, screens should be shown inside a subtle premium iPhone or similar phone mockup with a visible frame, while the main focus stays on the app content itself. This skill generates images only. It does not write code. | Leonxlnx/taste-skill | S3 |
| imagegen-frontend-web | Elite frontend image-direction skill for generating premium, conversion-aware website design references. CRITICAL OUTPUT RULE — generate ONE separate horizontal image FOR EVERY section. A landing page with 8 sections produces 8 images. Never compress multiple sections into one image. Enforces composition variety (not always left-text / right-image), background-image freedom, varied CTAs, varied hero scales (giant / mid / mini minimalist), narrative concept spine, second-read moments, and a single consistent palette across all images. Optimized for landing pages, marketing sites, and product comps that developers or coding models can accurately recreate. | Leonxlnx/taste-skill | S3 |
| impeccable | Use when the user wants to design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, extract, or otherwise improve a frontend interface. Covers websites, landing pages, dashboards, product UI, app shells, components, forms, settings, onboarding, and empty states. Handles UX review, visual hierarchy, information architecture, cognitive load, accessibility, performance, responsive behavior, theming, anti-patterns, typography, fonts, spacing, layout, alignment, color, motion, micro-interactions, UX copy, error states, edge cases, i18n, and reusable design systems or tokens. Also use for bland designs that need to become bolder or more delightful, loud designs that should become quieter, live browser iteration on UI elements, or ambitious visual effects that should feel technically extraordinary. Not for backend-only or non-UI tasks. | pbakaus/impeccable | S6 |
| industrial-brutalist-ui | Raw mechanical interfaces fusing Swiss typographic print with military terminal aesthetics. Rigid grids, extreme type scale contrast, utilitarian color, analog degradation effects. For data-heavy dashboards, portfolios, or editorial sites that need to feel like declassified blueprints. | Leonxlnx/taste-skill | S3 |
| launch | When the user wants to plan a product launch, feature announcement, or release strategy. Also use when the user mentions 'launch,' 'Product Hunt,' 'feature release,' 'announcement,' 'go-to-market,' 'beta launch,' 'early access,' 'waitlist,' 'product update,' 'how do I launch this,' 'launch checklist,' 'GTM plan,' or 'we're about to ship.' Use this whenever someone is preparing to release something publicly. For ongoing marketing after launch, see marketing-ideas. | coreyhaines31/marketingskills | S2 |
| lead-magnets | When the user wants to create, plan, or optimize a lead magnet for email capture or lead generation. Also use when the user mentions "lead magnet," "gated content," "content upgrade," "downloadable," "ebook," "cheat sheet," "checklist," "template download," "opt-in," "freebie," "PDF download," "resource library," "content offer," "email capture content," "Notion template," "spreadsheet template," or "what should I give away for emails." Use this for planning what to create and how to distribute it. For interactive tools as lead magnets, see free-tools. For writing the actual content, see copywriting. For the email sequence after capture, see emails. | coreyhaines31/marketingskills | S2 |
| marketing-ideas | When the user needs marketing ideas, inspiration, or strategies for their SaaS or software product. Also use when the user asks for 'marketing ideas,' 'growth ideas,' 'how to market,' 'marketing strategies,' 'marketing tactics,' 'ways to promote,' 'ideas to grow,' 'what else can I try,' 'I don't know how to market this,' 'brainstorm marketing,' or 'what marketing should I do.' Use this as a starting point whenever someone is stuck or looking for inspiration on how to grow. For specific channel execution, see the relevant skill (ads, social, emails, etc.). | coreyhaines31/marketingskills | S2 |
| marketing-psychology | When the user wants to apply psychological principles, mental models, or behavioral science to marketing. Also use when the user mentions 'psychology,' 'mental models,' 'cognitive bias,' 'persuasion,' 'behavioral science,' 'why people buy,' 'decision-making,' 'consumer behavior,' 'anchoring,' 'social proof,' 'scarcity,' 'loss aversion,' 'framing,' or 'nudge.' Use this whenever someone wants to understand or leverage how people think and make decisions in a marketing context. For applying psychology to specific pages, see cro; for pricing tactics, see pricing; for copy framing, see copywriting. | coreyhaines31/marketingskills | S2 |
| minimalist-ui | Clean editorial-style interfaces. Warm monochrome palette, typographic contrast, flat bento grids, muted pastels. No gradients, no heavy shadows. | Leonxlnx/taste-skill | S3 |
| onboarding | When the user wants to optimize post-signup onboarding, user activation, first-run experience, or time-to-value. Also use when the user mentions "onboarding flow," "activation rate," "user activation," "first-run experience," "empty states," "onboarding checklist," "aha moment," "new user experience," "users aren't activating," "nobody completes setup," "low activation rate," "users sign up but don't use the product," "time to value," or "first session experience." Use this whenever users are signing up but not sticking around. For signup/registration optimization, see signup. For ongoing email sequences, see emails. | coreyhaines31/marketingskills | S2 |
| pair-programming | AI-assisted pair programming with multiple modes (driver/navigator/switch), real-time verification, quality monitoring, and comprehensive testing. Supports TDD, debugging, refactoring, and learning sessions. Features automatic role switching, continuous code review, security scanning, and performance optimization with truth-score verification. | Local | L |
| paywalls | When the user wants to create or optimize in-app paywalls, upgrade screens, upsell modals, or feature gates. Also use when the user mentions "paywall," "upgrade screen," "upgrade modal," "upsell," "feature gate," "convert free to paid," "freemium conversion," "trial expiration screen," "limit reached screen," "plan upgrade prompt," "in-app pricing," "free users won't upgrade," "trial to paid conversion," or "how do I get users to pay." Use this for any in-product moment where you're asking users to upgrade. Distinct from public pricing pages (see cro) — this focuses on in-product upgrade moments where the user has already experienced value. For pricing decisions, see pricing. | coreyhaines31/marketingskills | S2 |
| popups | When the user wants to create or optimize popups, modals, overlays, slide-ins, or banners for conversion purposes. Also use when the user mentions "exit intent," "popup conversions," "modal optimization," "lead capture popup," "email popup," "announcement banner," "overlay," "collect emails with a popup," "exit popup," "scroll trigger," "sticky bar," or "notification bar." Use this for any overlay or interrupt-style conversion element. For forms outside of popups, see cro. For general page conversion optimization, see cro. | coreyhaines31/marketingskills | S2 |
| pricing | When the user wants help with pricing decisions, packaging, or monetization strategy. Also use when the user mentions 'pricing,' 'pricing tiers,' 'freemium,' 'free trial,' 'packaging,' 'price increase,' 'value metric,' 'Van Westendorp,' 'willingness to pay,' 'monetization,' 'how much should I charge,' 'my pricing is wrong,' 'pricing page,' 'annual vs monthly,' 'per seat pricing,' or 'should I offer a free plan.' Use this whenever someone is figuring out what to charge or how to structure their plans. For in-app upgrade screens, see paywalls. | coreyhaines31/marketingskills | S2 |
| product-marketing | When the user wants to create or update their product marketing context document. Also use when the user mentions 'product context,' 'marketing context,' 'set up context,' 'positioning,' 'who is my target audience,' 'describe my product,' 'ICP,' 'ideal customer profile,' or wants to avoid repeating foundational information across marketing tasks. Use this at the start of any new project before using other marketing skills — it creates `.agents/product-marketing.md` that all other skills reference for product, audience, and positioning context. | coreyhaines31/marketingskills | S2 |
| programmatic-seo | When the user wants to create SEO-driven pages at scale using templates and data. Also use when the user mentions "programmatic SEO," "template pages," "pages at scale," "directory pages," "location pages," "[keyword] + [city] pages," "comparison pages," "integration pages," "building many pages for SEO," "pSEO," "generate 100 pages," "data-driven pages," or "templated landing pages." Use this whenever someone wants to create many similar pages targeting different keywords or locations. For auditing existing SEO issues, see seo-audit. For content strategy planning, see content-strategy. | coreyhaines31/marketingskills | S2 |
| reasoningbank-agentdb | Implement ReasoningBank adaptive learning with AgentDB's 150x faster vector database. Includes trajectory tracking, verdict judgment, memory distillation, and pattern recognition. Use when building self-learning agents, optimizing decision-making, or implementing experience replay systems. | Local | R |
| reasoningbank-intelligence | Implement adaptive learning with ReasoningBank for pattern recognition, strategy optimization, and continuous improvement. Use when building self-learning agents, optimizing workflows, or implementing meta-cognitive systems. | Local | R |
| redesign-existing-projects | Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS. | Leonxlnx/taste-skill | S3 |
| referrals | When the user wants to create, optimize, or analyze a referral program, affiliate program, or word-of-mouth strategy. Also use when the user mentions 'referral,' 'affiliate,' 'ambassador,' 'word of mouth,' 'viral loop,' 'refer a friend,' 'partner program,' 'referral incentive,' 'how to get referrals,' 'customers referring customers,' or 'affiliate payout.' Use this whenever someone wants existing users or partners to bring in new customers. For launch-specific virality, see launch. | coreyhaines31/marketingskills | S2 |
| revops | When the user wants help with revenue operations, lead lifecycle management, or marketing-to-sales handoff processes. Also use when the user mentions 'RevOps,' 'revenue operations,' 'lead scoring,' 'lead routing,' 'MQL,' 'SQL,' 'pipeline stages,' 'deal desk,' 'CRM automation,' 'marketing-to-sales handoff,' 'data hygiene,' 'leads aren't getting to sales,' 'pipeline management,' 'lead qualification,' or 'when should marketing hand off to sales.' Use this for anything involving the systems and processes that connect marketing to revenue. For cold outreach emails, see cold-email. For email drip campaigns, see emails. For pricing decisions, see pricing. | coreyhaines31/marketingskills | S2 |
| sales-enablement | When the user wants to create sales collateral, pitch decks, one-pagers, objection handling docs, or demo scripts. Also use when the user mentions 'sales deck,' 'pitch deck,' 'one-pager,' 'leave-behind,' 'objection handling,' 'deal-specific ROI analysis,' 'demo script,' 'talk track,' 'sales playbook,' 'proposal template,' 'buyer persona card,' 'help my sales team,' 'sales materials,' or 'what should I give my sales reps.' Use this for any document or asset that helps a sales team close deals. For competitor comparison pages and battle cards, see competitors. For marketing website copy, see copywriting. For cold outreach emails, see cold-email. | coreyhaines31/marketingskills | S2 |
| schema | When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." Use this whenever someone wants their pages to show enhanced results in Google. For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo. | coreyhaines31/marketingskills | S2 |
| seo | Optimize for search engine visibility and ranking. Use when asked to "improve SEO", "optimize for search", "fix meta tags", "add structured data", "sitemap optimization", or "search engine optimization". | addyosmani/web-quality-skills | S7 |
| seo-audit | When the user wants to audit, review, or diagnose SEO issues on their site. Also use when the user mentions "SEO audit," "technical SEO," "why am I not ranking," "SEO issues," "on-page SEO," "meta tags review," "SEO health check," "my traffic dropped," "lost rankings," "not showing up in Google," "site isn't ranking," "Google update hit me," "page speed," "core web vitals," "crawl errors," or "indexing issues." Use this even if the user just says something vague like "my SEO is bad" or "help with SEO" — start with an audit. For building pages at scale to target keywords, see programmatic-seo. For adding structured data, see schema. For AI search optimization, see ai-seo. | coreyhaines31/marketingskills | S2 |
| shadcn | Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file. Also triggers for "shadcn init", "create an app with --preset", or "switch to --preset". | shadcn/ui | S8 |
| signup | When the user wants to optimize signup, registration, account creation, or trial activation flows. Also use when the user mentions "signup conversions," "registration friction," "signup form optimization," "free trial signup," "reduce signup dropoff," "account creation flow," "people aren't signing up," "signup abandonment," "trial conversion rate," "nobody completes registration," "too many steps to sign up," or "simplify our signup." Use this whenever the user has a signup or registration flow that isn't performing. For post-signup onboarding, see onboarding. For lead capture forms (not account creation), see cro. | coreyhaines31/marketingskills | S2 |
| site-architecture | When the user wants to plan, map, or restructure their website's page hierarchy, navigation, URL structure, or internal linking. Also use when the user mentions "sitemap," "site map," "visual sitemap," "site structure," "page hierarchy," "information architecture," "IA," "navigation design," "URL structure," "breadcrumbs," "internal linking strategy," "website planning," "what pages do I need," "how should I organize my site," or "site navigation." Use this whenever someone is planning what pages a website should have and how they connect. NOT for XML sitemaps (that's technical SEO — see seo-audit). For SEO audits, see seo-audit. For structured data, see schema. | coreyhaines31/marketingskills | S2 |
| skill-builder | Create new Codex Skills with proper YAML frontmatter, progressive disclosure structure, and complete directory organization. Use when you need to build custom skills for specific workflows, generate skill templates, or understand the Codex Skills specification. | Local | L |
| sms | When the user wants to plan, build, or optimize SMS or MMS marketing — including welcome flows, abandoned cart texts, post-purchase, win-back, promotional sends, or transactional/auth SMS. Also use when the user mentions "SMS marketing," "text message campaigns," "SMS sequence," "SMS automation," "abandoned cart text," "post-purchase SMS," "Klaviyo SMS," "Postscript," "Attentive," "Twilio," "A2P 10DLC," "TCPA," "SMS compliance," "short code," "toll-free SMS," "MMS campaign," "should I do SMS," or "SMS vs email." For email sequences, see emails. For SMS copy framing, see copywriting. For opt-in popups that capture phone numbers, see popups. | coreyhaines31/marketingskills | S2 |
| social | When the user wants help creating, scheduling, or optimizing social media content for LinkedIn, Twitter/X, Instagram, TikTok, Facebook, or other platforms. Also use when the user mentions 'LinkedIn post,' 'Twitter thread,' 'social media,' 'content calendar,' 'social scheduling,' 'engagement,' 'viral content,' 'what should I post,' 'repurpose this content,' 'tweet ideas,' 'LinkedIn carousel,' 'social media strategy,' 'grow my following,' 'TikTok video,' 'Reels,' 'Shorts,' 'video script,' 'video hook,' 'short-form video,' or 'create a reel.' Use this for social media content creation, repurposing, scheduling, and short-form video scripting. For broader content strategy, see content-strategy. For paid video ads, see ad-creative. | coreyhaines31/marketingskills | S2 |
| source-command-adopt-dannflow | Bootstrap an existing repo into a first-class DannFlow project. Installs CI (and proves it passes), creates the dannflow.json version anchor, sets up the dev/feat branch flow, then runs the first sync from upstream. | Local | D |
| source-command-agents-agent-capabilities | Capability matrix for all agent types | Local | D |
| source-command-agents-agent-types | Complete guide to all 87 available agent types in Codex Flow V3 | Local | D |
| source-command-agents-health | Show agent health and metrics | Local | D |
| source-command-agents-list | List all active agents | Local | D |
| source-command-agents-logs | Show agent activity logs | Local | D |
| source-command-agents-metrics | Show agent performance metrics | Local | D |
| source-command-agents-pool | Manage agent pool for scaling | Local | D |
| source-command-agents-spawn | Spawn a new agent with V3 capabilities | Local | D |
| source-command-agents-status | Show detailed status of an agent | Local | D |
| source-command-agents-stop | Stop a running agent | Local | D |
| source-command-checkpoint | Snapshots the live Supabase schema (tables, enums, RLS policies, triggers, functions) to a timestamped SQL file in supabase/backups/. | Local | D |
| source-command-claude-flow-help | Show Codex-Flow commands and usage | Local | D |
| source-command-claude-flow-memory | Interact with Codex-Flow memory system | Local | D |
| source-command-claude-flow-swarm | Coordinate multi-agent swarms for complex tasks | Local | D |
| source-command-cleanup | Finds dead code, unused exports, orphaned components, and stale files. Reports only — does not delete. | Local | D |
| source-command-commit | Stages changes and drafts a conventional commit message based on what changed. | Local | D |
| source-command-design-project | Apply approved product theme and copy to an existing template without altering its structure, interactions, or protected hero media. | Local | D |
| source-command-explain-schema | Pulls the live Supabase schema via MCP and produces a human-readable summary of tables, relationships, and RLS policies. | Local | D |
| source-command-init-claude | Rewrites the entire Codex environment (AGENTS.md, SKILLS.md, commands README, individual command files, and the Codex-workflow.md command tables) to match the actual project state from README + package.json + src/. | Local | D |
| source-command-init-update | Update your DannFlow project to the latest version—pull new commands, scripts, guide, skills, and more while preserving your code. | Local | D |
| source-command-masterplan-task | Execute an ordered task from MASTERPLAN.md, keep it In progress, and tell the user to run /verify-task when implementation appears ready. | Local | D |
| source-command-no-conflict | Audit repo for conflicts between documentation and actual code — technology versions, features, commands, RLS, semantic tokens, folder structure. Use --fix to auto-remediate. | Local | D |
| source-command-review | Pre-PR review. Runs lint and typecheck, then critiques the current branch diff against AGENTS.md guardrails. | Local | D |
| source-command-rls-check | Walks every file in src/services/ and confirms each Supabase query filters by organization_id (tenant isolation). Cross-references src/types/supabase.ts. | Local | D |
| source-command-security-audit | Full security scan of the working tree or current branch diff. Catches secret leaks, service-role exposure, XSS, missing 'use server', and other OWASP-style issues. | Local | D |
| source-command-sparc-ask | ❓Ask - You are a task-formulation guide that helps users navigate, ask, and delegate tasks to the correc... | Local | D |
| source-command-sparc-code | 🧠 Auto-Coder - You write clean, efficient, modular code based on pseudocode and architecture. You use configurat... | Local | D |
| source-command-sparc-debug | 🪲 Debugger - You troubleshoot runtime bugs, logic errors, or integration failures by tracing, inspecting, and ... | Local | D |
| source-command-sparc-devops | 🚀 DevOps - You are the DevOps automation and infrastructure specialist responsible for deploying, managing, ... | Local | D |
| source-command-sparc-docs-writer | 📚 Documentation Writer - You write concise, clear, and modular Markdown documentation that explains usage, integration, se... | Local | D |
| source-command-sparc-integration | 🔗 System Integrator - You merge the outputs of all modes into a working, tested, production-ready system. You ensure co... | Local | D |
| source-command-sparc-mcp | ♾️ MCP Integration - You are the MCP (Management Control Panel) integration specialist responsible for connecting to a... | Local | D |
| source-command-sparc-post-deployment-monitoring-mode | 📈 Deployment Monitor - You observe the system post-launch, collecting performance, logs, and user feedback. You flag reg... | Local | D |
| source-command-sparc-refinement-optimization-mode | 🧹 Optimizer - You refactor, modularize, and improve system performance. You enforce file size limits, dependenc... | Local | D |
| source-command-sparc-security-review | 🛡️ Security Reviewer - You perform static and dynamic audits to ensure secure code practices. You flag secrets, poor mod... | Local | D |
| source-command-sparc-sparc | ⚡️ SPARC Orchestrator - You are SPARC, the orchestrator of complex workflows. You break down large objectives into delega... | Local | D |
| source-command-sparc-spec-pseudocode | 📋 Specification Writer - You capture full project context—functional requirements, edge cases, constraints—and translate t... | Local | D |
| source-command-sparc-tutorial | 📘 SPARC Tutorial - You are the SPARC onboarding and education assistant. Your job is to guide users through the full... | Local | D |
| source-command-sync-commands | Scans .Codex/commands/ for orphaned commands missing from documentation or guide.sh. Identifies gaps and optionally auto-patches. | Local | D |
| source-command-sync-to-upstream | Contribute generic improvements back to DannFlow upstream, including explicitly approved reusable schema changes verified against the template database before PR creation. | Local | D |
| source-command-sync-types | Regenerates src/types/supabase.ts, diffs before and after, and summarizes schema drift. | Local | D |
| source-command-update-dannflow | Auto-detect which DannFlow version this project is on and pull the latest updates from upstream. Creates dannflow.json if missing. The smart entry point for keeping any DannFlow-based project up to date. | Local | D |
| sparc-methodology | SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) comprehensive development methodology with multi-agent orchestration | Local | L |
| stitch-design-taste | Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files that enforce premium, anti-generic UI standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion, and hardware-accelerated performance. | Leonxlnx/taste-skill | S3 |
| stream-chain | Stream-JSON chaining for multi-agent pipelines, data transformation, and sequential workflows | Local | L |
| swarm-advanced | Advanced swarm orchestration patterns for research, development, testing, and complex distributed workflows | Local | L |
| swarm-orchestration | Orchestrate multi-agent swarms with agentic-flow for parallel task execution, dynamic topology, and intelligent coordination. Use when scaling beyond single agents, implementing complex workflows, or building distributed AI systems. | Local | L |
| v3-cli-modernization | CLI modernization and hooks system enhancement for Codex-flow v3. Implements interactive prompts, command decomposition, enhanced hooks integration, and intelligent workflow automation. | Local | R |
| v3-core-implementation | Core module implementation for Codex-flow v3. Implements DDD domains, clean architecture patterns, dependency injection, and modular TypeScript codebase with comprehensive testing. | Local | R |
| v3-ddd-architecture | Domain-Driven Design architecture for Codex-flow v3. Implements modular, bounded context architecture with clean separation of concerns and microkernel pattern. | Local | R |
| v3-integration-deep | Deep agentic-flow@alpha integration implementing ADR-001. Eliminates 10,000+ duplicate lines by building Codex-flow as specialized extension rather than parallel implementation. | Local | R |
| v3-mcp-optimization | MCP server optimization and transport layer enhancement for Codex-flow v3. Implements connection pooling, load balancing, tool registry optimization, and performance monitoring for sub-100ms response times. | Local | R |
| v3-memory-unification | Unify 6+ memory systems into AgentDB with HNSW indexing for 150x-12,500x search improvements. Implements ADR-006 (Unified Memory Service) and ADR-009 (Hybrid Memory Backend). | Local | R |
| v3-performance-optimization | Achieve aggressive v3 performance targets: 2.49x-7.47x Flash Attention speedup, 150x-12,500x search improvements, 50-75% memory reduction. Comprehensive benchmarking and optimization suite. | Local | R |
| v3-security-overhaul | Complete security architecture overhaul for Codex-flow v3. Addresses critical CVEs (CVE-1, CVE-2, CVE-3) and implements secure-by-default patterns. Use for security-first v3 implementation. | Local | R |
| v3-swarm-coordination | 15-agent hierarchical mesh coordination for v3 implementation. Orchestrates parallel execution across security, core, and integration domains following 10 ADRs with 14-week timeline. | Local | R |
| verification-quality | Comprehensive truth scoring, code quality verification, and automatic rollback system with 0.95 accuracy threshold for ensuring high-quality agent outputs and codebase reliability. | Local | L |
| video | When the user wants to create, generate, or produce video content using AI tools or programmatic frameworks. Also use when the user mentions 'video production,' 'AI video,' 'Remotion,' 'Hyperframes,' 'HeyGen,' 'Synthesia,' 'Veo,' 'Sora,' 'Runway,' 'Kling,' 'Seedance,' 'Hailuo,' 'MiniMax,' 'Pika,' 'Hunyuan,' 'Wan,' 'video generation,' 'AI avatar,' 'talking head video,' 'programmatic video,' 'video template,' 'explainer video,' 'product demo video,' 'video pipeline,' or 'make me a video.' Use this for video creation, generation, and production workflows. For video content strategy and what to post, see social. For paid video ad creative, see ad-creative. | coreyhaines31/marketingskills | S2 |

# Appendix B — All 197 command/reference Markdown files

These are prompts and indexes, not all executable slash commands. P = adapt to native host prompt/skill. D = DannFlow-specific integration. Each row preserves the manifest's intended purpose; inspect the source prompt for detailed procedure.

| File | Description | Port |
| --- | --- | --- |
| .claude/commands/adopt-dannflow.md | Bootstrap an existing repo into a first-class DannFlow project. Installs CI (and proves it passes), creates the dannflow.json version anchor, sets up the dev/feat branch flow, then runs the first sync from upstream. | D |
| .claude/commands/agents/agent-capabilities.md | Capability matrix for all agent types | P |
| .claude/commands/agents/agent-coordination.md | agent-coordination | P |
| .claude/commands/agents/agent-spawning.md | agent-spawning | P |
| .claude/commands/agents/agent-types.md | Complete guide to all 87 available agent types in Claude Flow V3 | P |
| .claude/commands/agents/health.md | Show agent health and metrics | P |
| .claude/commands/agents/list.md | List all active agents | P |
| .claude/commands/agents/logs.md | Show agent activity logs | P |
| .claude/commands/agents/metrics.md | Show agent performance metrics | P |
| .claude/commands/agents/pool.md | Manage agent pool for scaling | P |
| .claude/commands/agents/README.md | Agents Commands | P |
| .claude/commands/agents/spawn.md | Spawn a new agent with V3 capabilities | P |
| .claude/commands/agents/status.md | Show detailed status of an agent | P |
| .claude/commands/agents/stop.md | Stop a running agent | P |
| .claude/commands/analysis/bottleneck-detect.md | bottleneck detect | P |
| .claude/commands/analysis/COMMAND_COMPLIANCE_REPORT.md | Analysis Commands Compliance Report | P |
| .claude/commands/analysis/performance-bottlenecks.md | Performance Bottleneck Analysis | P |
| .claude/commands/analysis/performance-report.md | performance-report | P |
| .claude/commands/analysis/README.md | Analysis Commands | P |
| .claude/commands/analysis/token-efficiency.md | Token Usage Optimization | P |
| .claude/commands/analysis/token-usage.md | token-usage | P |
| .claude/commands/ask-command.md | Meta-router. Describe what you want; returns the best custom command + a ready-to-paste prompt. | P |
| .claude/commands/auto-docs.md | Audits the entire repo for documentation drift — commands, skills, npm scripts, env vars, tech stack, and folder structure — and reports or auto-patches gaps. Broader superset of /sync-commands. | P |
| .claude/commands/automation/auto-agent.md | auto agent | P |
| .claude/commands/automation/README.md | Automation Commands | P |
| .claude/commands/automation/self-healing.md | Self-Healing Workflows | P |
| .claude/commands/automation/session-memory.md | Cross-Session Memory | P |
| .claude/commands/automation/smart-agents.md | Smart Agent Auto-Spawning | P |
| .claude/commands/automation/smart-spawn.md | smart-spawn | P |
| .claude/commands/automation/workflow-select.md | workflow-select | P |
| .claude/commands/checkpoint.md | Snapshots the live Supabase schema (tables, enums, RLS policies, triggers, functions) to a timestamped SQL file in supabase/backups/. | P |
| .claude/commands/claude-flow-help.md | Show Claude-Flow commands and usage | P |
| .claude/commands/claude-flow-memory.md | Interact with Claude-Flow memory system | P |
| .claude/commands/claude-flow-swarm.md | Coordinate multi-agent swarms for complex tasks | P |
| .claude/commands/cleanup.md | Finds dead code, unused exports, orphaned components, and stale files. Reports only — does not delete. | P |
| .claude/commands/close-task.md | Close a human-verified tracked task by committing completed work, recording a short verification note, then updating MASTERPLAN.md and the linked GitHub Project to Done. | P |
| .claude/commands/commit.md | Stages changes and drafts a conventional commit message based on what changed. | P |
| .claude/commands/coordination/agent-spawn.md | agent-spawn | P |
| .claude/commands/coordination/init.md | Initialize Coordination Framework | P |
| .claude/commands/coordination/orchestrate.md | Coordinate Task Execution | P |
| .claude/commands/coordination/README.md | Coordination Commands | P |
| .claude/commands/coordination/spawn.md | Create Cognitive Patterns | P |
| .claude/commands/coordination/swarm-init.md | swarm init | P |
| .claude/commands/coordination/task-orchestrate.md | task-orchestrate | P |
| .claude/commands/design-project.md | Apply approved product copy and semantic theme tokens to the existing template without changing its layout, interactions, or hero media. | P |
| .claude/commands/explain-schema.md | Pulls the live Supabase schema via MCP and produces a human-readable summary of tables, relationships, and RLS policies. | P |
| .claude/commands/github/code-review-swarm.md | Code Review Swarm - Automated Code Review with AI Agents | P |
| .claude/commands/github/code-review.md | code-review | P |
| .claude/commands/github/github-modes.md | GitHub Integration Modes | P |
| .claude/commands/github/github-swarm.md | github swarm | P |
| .claude/commands/github/issue-tracker.md | GitHub Issue Tracker | P |
| .claude/commands/github/issue-triage.md | issue-triage | P |
| .claude/commands/github/multi-repo-swarm.md | Multi-Repo Swarm - Cross-Repository Swarm Orchestration | P |
| .claude/commands/github/pr-enhance.md | pr-enhance | P |
| .claude/commands/github/pr-manager.md | GitHub PR Manager | P |
| .claude/commands/github/project-board-sync.md | Project Board Sync - GitHub Projects Integration | P |
| .claude/commands/github/README.md | Github Commands | P |
| .claude/commands/github/release-manager.md | GitHub Release Manager | P |
| .claude/commands/github/release-swarm.md | Release Swarm - Intelligent Release Automation | P |
| .claude/commands/github/repo-analyze.md | repo-analyze | P |
| .claude/commands/github/repo-architect.md | GitHub Repository Architect | P |
| .claude/commands/github/swarm-issue.md | Create a task for AI swarm processing | P |
| .claude/commands/github/swarm-pr.md | Swarm PR - Managing Swarms through Pull Requests | P |
| .claude/commands/github/sync-coordinator.md | GitHub Sync Coordinator | D |
| .claude/commands/github/workflow-automation.md | Custom swarm-powered action | P |
| .claude/commands/help-dannflow.md | Report-only DannFlow command catalog with Claude and Codex usage, grouped by category with a Mermaid graph. | D |
| .claude/commands/hero-bg.md | Inspects a project's hero and generates a guided two-image, one-video AI background workflow with loop-safe prompts and asset delivery steps. | P |
| .claude/commands/hive-mind/hive-mind-consensus.md | hive-mind-consensus | P |
| .claude/commands/hive-mind/hive-mind-init.md | hive-mind-init | P |
| .claude/commands/hive-mind/hive-mind-memory.md | hive-mind-memory | P |
| .claude/commands/hive-mind/hive-mind-metrics.md | hive-mind-metrics | P |
| .claude/commands/hive-mind/hive-mind-resume.md | hive-mind-resume | P |
| .claude/commands/hive-mind/hive-mind-sessions.md | hive-mind-sessions | P |
| .claude/commands/hive-mind/hive-mind-spawn.md | hive-mind-spawn | P |
| .claude/commands/hive-mind/hive-mind-status.md | hive-mind-status | P |
| .claude/commands/hive-mind/hive-mind-stop.md | hive-mind-stop | P |
| .claude/commands/hive-mind/hive-mind-wizard.md | hive-mind-wizard | P |
| .claude/commands/hive-mind/hive-mind.md | hive-mind | P |
| .claude/commands/hive-mind/README.md | Hive-mind Commands | P |
| .claude/commands/hooks/overview.md | Claude Code Hooks for claude-flow | P |
| .claude/commands/hooks/post-edit.md | hook post-edit | P |
| .claude/commands/hooks/post-task.md | hook post-task | P |
| .claude/commands/hooks/pre-edit.md | hook pre-edit | P |
| .claude/commands/hooks/pre-task.md | hook pre-task | P |
| .claude/commands/hooks/README.md | Hooks Commands | P |
| .claude/commands/hooks/session-end.md | hook session-end | P |
| .claude/commands/hooks/setup.md | Setting Up ruv-swarm Hooks | P |
| .claude/commands/init-claude.md | Rewrites the entire Claude environment (CLAUDE.md, SKILLS.md, commands README, individual command files, and the claude-workflow.md command tables) to match the actual project state from README + package.json + src/. | P |
| .claude/commands/init-update.md | Update your DannFlow project to the latest version—pull new commands, scripts, guide, skills, and more while preserving your code. | P |
| .claude/commands/juanstack-init.md | Interactive interview and setup agent for JuanStack verticals: captures domain context, writes business.json, scaffolds vertical AI manifest, populates PROJECT_CONTEXT.md, and logs to PENDING_DOC_UPDATES.md. | D |
| .claude/commands/make-command.md | Creates a new custom slash command from a plain-English description. Auto-updates claude-workflow.md tables and proposes conflict-avoidance edits to existing commands, CLAUDE.md, or SKILLS.md when needed. | P |
| .claude/commands/make-masterplan.md | Expand one or more future MASTERPLAN phases into detailed ordered tasks and sync their cards to the linked GitHub Project. | D |
| .claude/commands/marketing-check.md | Conversion-fundamentals audit for landing/marketing pages — hero clarity, CTA, social proof, pricing legibility, friction. Opinionated, judgement-heavy. Reports only. | P |
| .claude/commands/masterplan-init.md | Verify a DannFlow project is initialized, require an existing Kanban-style GitHub Project, then create detailed Phase 0 readiness cards including Vercel deployment setup. | D |
| .claude/commands/masterplan-task.md | Execute an ordered task from MASTERPLAN.md, keep it In progress, and tell the user to run /verify-task when implementation appears ready. | D |
| .claude/commands/memory/memory-persist.md | memory-persist | P |
| .claude/commands/memory/memory-search.md | memory-search | P |
| .claude/commands/memory/memory-usage.md | memory-usage | P |
| .claude/commands/memory/neural.md | Neural Pattern Training | P |
| .claude/commands/memory/README.md | Memory Commands | P |
| .claude/commands/migrate.md | Safely changes database schema through SQL migration files, Supabase verification, and synced types. | P |
| .claude/commands/monitoring/agent-metrics.md | agent-metrics | P |
| .claude/commands/monitoring/agents.md | List Active Patterns | P |
| .claude/commands/monitoring/README.md | Monitoring Commands | P |
| .claude/commands/monitoring/real-time-view.md | real-time-view | P |
| .claude/commands/monitoring/status.md | Check Coordination Status | P |
| .claude/commands/monitoring/swarm-monitor.md | swarm-monitor | P |
| .claude/commands/new-feature.md | Scaffolds a new feature end-to-end — service file, types, App Router page, and Shadcn form following the Card pattern. | P |
| .claude/commands/new-page.md | Scaffolds a new App Router page (Server Component) with loading.tsx and error.tsx, wrapped in the Shadcn Card layout. | P |
| .claude/commands/new-project.md | Initialize a fresh DannFlow project: capture product context, configure the project repository origin, and hand off Supabase setup to masterplan initialization. | P |
| .claude/commands/no-conflict.md | Audit repo for conflicts between documentation and actual code — technology versions, features, commands, RLS, semantic tokens, folder structure. Use --fix to auto-remediate. | P |
| .claude/commands/optimization/auto-topology.md | Automatic Topology Selection | P |
| .claude/commands/optimization/cache-manage.md | cache-manage | P |
| .claude/commands/optimization/parallel-execute.md | parallel-execute | P |
| .claude/commands/optimization/parallel-execution.md | Parallel Task Execution | P |
| .claude/commands/optimization/README.md | Optimization Commands | P |
| .claude/commands/optimization/topology-optimize.md | topology-optimize | P |
| .claude/commands/pause-supabase.md | Pause a selected Supabase project through Supabase MCP after listing projects and confirming the exact target. | D |
| .claude/commands/README.md | One-line summary used by /ask-command for routing. | P |
| .claude/commands/review.md | Pre-PR review. Runs lint and typecheck, then critiques the current branch diff against CLAUDE.md guardrails. | P |
| .claude/commands/rls-check.md | Walks every file in src/services/ and confirms each Supabase query matches the project's RLS ownership or admin policy. Cross-references src/types/supabase.ts. | P |
| .claude/commands/rls.md | Inspects RLS policies for a single Supabase table. Returns who can SELECT/INSERT/UPDATE/DELETE and any gaps. | P |
| .claude/commands/ruflo-upgrade.md | Re-applies Ruflo-aware patterns (memory check preamble, parallel agent hints, memory postamble) to the 8 core DannFlow commands. Safe to re-run after /init-update overwrites them. | P |
| .claude/commands/schema-change.md | Applies an explicit Supabase MCP schema change, records the approved SQL in a tracked migration file, regenerates TypeScript types, and verifies RLS. | P |
| .claude/commands/security-audit.md | Full security scan of the working tree or current branch diff. Catches secret leaks, service-role exposure, XSS, missing 'use server', and other OWASP-style issues. | P |
| .claude/commands/seed.md | Generates realistic, type-safe seed data from src/types/supabase.ts. Respects foreign keys and RLS ownership. Writes to supabase/seeds/. | P |
| .claude/commands/seo-check.md | Audits Next.js App Router routes for SEO completeness — metadata, OG tags, canonicals, sitemap.ts, robots.ts, JSON-LD, alt text, heading hierarchy. Reports gaps only. | P |
| .claude/commands/seo-fix.md | Active rewrite — adds missing SEO essentials (metadata, OG tags, canonical, JSON-LD, alt text, heading fixes) to one route or all routes. Plan-then-confirm flow. | P |
| .claude/commands/setup-auth.md | Configure and verify the existing DannFlow template's email authentication, Google sign-in, redirect URLs, and branded Supabase email templates without changing database schema. | P |
| .claude/commands/setup-supabase.md | Guide the existing DannFlow template's Supabase environment values and project connection without designing or changing database schema. | D |
| .claude/commands/setup-vercel.md | Deploy the existing DannFlow app on Vercel, configure only required runtime environment variables, and register the canonical production URL with Supabase Auth and Google OAuth. | P |
| .claude/commands/sparc/analyzer.md | SPARC Analyzer Mode | P |
| .claude/commands/sparc/architect.md | SPARC Architect Mode | P |
| .claude/commands/sparc/ask.md | ❓Ask - You are a task-formulation guide that helps users navigate, ask, and delegate tasks to the correc... | P |
| .claude/commands/sparc/batch-executor.md | SPARC Batch Executor Mode | P |
| .claude/commands/sparc/code.md | 🧠 Auto-Coder - You write clean, efficient, modular code based on pseudocode and architecture. You use configurat... | P |
| .claude/commands/sparc/coder.md | SPARC Coder Mode | P |
| .claude/commands/sparc/debug.md | 🪲 Debugger - You troubleshoot runtime bugs, logic errors, or integration failures by tracing, inspecting, and ... | P |
| .claude/commands/sparc/debugger.md | SPARC Debugger Mode | P |
| .claude/commands/sparc/designer.md | SPARC Designer Mode | P |
| .claude/commands/sparc/devops.md | 🚀 DevOps - You are the DevOps automation and infrastructure specialist responsible for deploying, managing, ... | P |
| .claude/commands/sparc/docs-writer.md | 📚 Documentation Writer - You write concise, clear, and modular Markdown documentation that explains usage, integration, se... | P |
| .claude/commands/sparc/documenter.md | SPARC Documenter Mode | P |
| .claude/commands/sparc/innovator.md | SPARC Innovator Mode | P |
| .claude/commands/sparc/integration.md | 🔗 System Integrator - You merge the outputs of all modes into a working, tested, production-ready system. You ensure co... | P |
| .claude/commands/sparc/mcp.md | ♾️ MCP Integration - You are the MCP (Management Control Panel) integration specialist responsible for connecting to a... | P |
| .claude/commands/sparc/memory-manager.md | SPARC Memory Manager Mode | P |
| .claude/commands/sparc/optimizer.md | SPARC Optimizer Mode | P |
| .claude/commands/sparc/orchestrator.md | SPARC Orchestrator Mode | P |
| .claude/commands/sparc/post-deployment-monitoring-mode.md | 📈 Deployment Monitor - You observe the system post-launch, collecting performance, logs, and user feedback. You flag reg... | P |
| .claude/commands/sparc/refinement-optimization-mode.md | 🧹 Optimizer - You refactor, modularize, and improve system performance. You enforce file size limits, dependenc... | P |
| .claude/commands/sparc/researcher.md | SPARC Researcher Mode | P |
| .claude/commands/sparc/reviewer.md | SPARC Reviewer Mode | P |
| .claude/commands/sparc/security-review.md | 🛡️ Security Reviewer - You perform static and dynamic audits to ensure secure code practices. You flag secrets, poor mod... | P |
| .claude/commands/sparc/sparc-modes.md | SPARC Modes Overview | P |
| .claude/commands/sparc/sparc.md | ⚡️ SPARC Orchestrator - You are SPARC, the orchestrator of complex workflows. You break down large objectives into delega... | P |
| .claude/commands/sparc/spec-pseudocode.md | 📋 Specification Writer - You capture full project context—functional requirements, edge cases, constraints—and translate t... | P |
| .claude/commands/sparc/supabase-admin.md | 🔐 Supabase Admin - You are the Supabase database, authentication, and storage specialist. You design and implement d... | D |
| .claude/commands/sparc/swarm-coordinator.md | SPARC Swarm Coordinator Mode | P |
| .claude/commands/sparc/tdd.md | SPARC TDD Mode | P |
| .claude/commands/sparc/tester.md | SPARC Tester Mode | P |
| .claude/commands/sparc/tutorial.md | 📘 SPARC Tutorial - You are the SPARC onboarding and education assistant. Your job is to guide users through the full... | P |
| .claude/commands/sparc/workflow-manager.md | SPARC Workflow Manager Mode | P |
| .claude/commands/start-supabase.md | Restore/start the Supabase project from .env.local or an explicit ref, explicitly separating MCP-visible projects from Supabase-counted free-plan projects. | D |
| .claude/commands/swarm/analysis.md | Analysis Swarm Strategy | P |
| .claude/commands/swarm/development.md | Development Swarm Strategy | P |
| .claude/commands/swarm/examples.md | Examples Swarm Strategy | P |
| .claude/commands/swarm/maintenance.md | Maintenance Swarm Strategy | P |
| .claude/commands/swarm/optimization.md | Optimization Swarm Strategy | P |
| .claude/commands/swarm/README.md | Swarm Commands | P |
| .claude/commands/swarm/research.md | Research Swarm Strategy | P |
| .claude/commands/swarm/swarm-analysis.md | swarm-analysis | P |
| .claude/commands/swarm/swarm-background.md | swarm-background | P |
| .claude/commands/swarm/swarm-init.md | swarm-init | P |
| .claude/commands/swarm/swarm-modes.md | swarm-modes | P |
| .claude/commands/swarm/swarm-monitor.md | swarm-monitor | P |
| .claude/commands/swarm/swarm-spawn.md | swarm-spawn | P |
| .claude/commands/swarm/swarm-status.md | swarm-status | P |
| .claude/commands/swarm/swarm-strategies.md | swarm-strategies | P |
| .claude/commands/swarm/swarm.md | /swarm | P |
| .claude/commands/swarm/testing.md | Testing Swarm Strategy | P |
| .claude/commands/sync-commands.md | Scans .claude/commands/ for orphaned commands missing from documentation or guide.sh. Identifies gaps and optionally auto-patches. | D |
| .claude/commands/sync-to-upstream.md | Contribute generic improvements back to DannFlow upstream, including explicitly approved reusable schema changes that are verified against the template database before PR creation. | D |
| .claude/commands/sync-types.md | Regenerates src/types/supabase.ts, diffs before and after, and summarizes schema drift. | D |
| .claude/commands/sync-upstream.md | Pull DannFlow updates into a project, exactly mirror template Claude commands, and automatically detect, validate, and apply required template database migrations. | D |
| .claude/commands/ui.md | Active rewrite — makes target file or current diff fully responsive. Mobile-first, 48px touch targets, labels above inputs, focus rings, semantic tokens only. | P |
| .claude/commands/update-dannflow.md | Auto-detect which DannFlow version this project is on and pull the latest updates from upstream. Creates dannflow.json if missing. The smart entry point for keeping any DannFlow-based project up to date. | D |
| .claude/commands/update-masterplan.md | Sync edits in MASTERPLAN.md to a linked GitHub Project while preserving ordered task IDs and live statuses. | D |
| .claude/commands/verify-juanstack.md | Generate a human verification checklist for a completed JuanStack masterplan phase. Tells the user exactly what to open, read, and confirm in their editor, terminal, and browser before approving the phase. | D |
| .claude/commands/verify-task.md | Generate a human verification checklist for the current tracked task, then tell the user to run /close-task only after they confirm it works. | P |
| .claude/commands/what-task.md | Inspect MASTERPLAN.md and the linked GitHub Project, organize Ready tasks, and ask which task the user wants to handle next. | P |
| .claude/commands/workflows/development.md | Development Workflow Coordination | P |
| .claude/commands/workflows/README.md | Workflows Commands | P |
| .claude/commands/workflows/research.md | Research Workflow Coordination | P |
| .claude/commands/workflows/workflow-create.md | workflow-create | P |
| .claude/commands/workflows/workflow-execute.md | workflow-execute | P |
| .claude/commands/workflows/workflow-export.md | workflow-export | P |

# Appendix C — All 41 helper files

Descriptions are taken from each file's header. “Optional / inspect callers” means it is not one of the active Husky entry points. Review shell/platform assumptions before reuse.

| File | Stated purpose | Note |
| --- | --- | --- |
| .claude/helpers/adr-compliance.sh | Claude Flow V3 - ADR Compliance Checker Worker | Optional / inspect callers |
| .claude/helpers/auto-commit.sh | Auto-commit helper for Claude Code hooks | Dangerous if enabled; review first |
| .claude/helpers/auto-memory-hook.mjs | /** * Auto Memory Bridge Hook (ADR-048/049) * | Optional / inspect callers |
| .claude/helpers/checkpoint-manager.sh | Claude Checkpoint Manager | Dangerous if enabled; review first |
| .claude/helpers/daemon-manager.sh | Claude Flow V3 - Daemon Manager | Optional / inspect callers |
| .claude/helpers/ddd-tracker.sh | Claude Flow V3 - DDD Progress Tracker Worker | Optional / inspect callers |
| .claude/helpers/github-safe.js | /** * Safe GitHub CLI Helper — v1.0.0 * | Optional / inspect callers |
| .claude/helpers/github-setup.sh | Security rationale: set -euo pipefail ensures that: | Optional / inspect callers |
| .claude/helpers/guidance-hook.sh | Capture hook guidance for Claude visibility | Optional / inspect callers |
| .claude/helpers/guidance-hooks.sh | Guidance Hooks for Claude Flow V3 | Optional / inspect callers |
| .claude/helpers/health-monitor.sh | Claude Flow V3 - Health Monitor Worker | Optional / inspect callers |
| .claude/helpers/hook-handler.cjs | /** * Claude Flow Hook Handler (Cross-Platform) * Dispatches hook events to the appropriate helper modules. | Optional / inspect callers |
| .claude/helpers/intelligence.cjs | /** * Intelligence Layer (ADR-050) * | Optional / inspect callers |
| .claude/helpers/learning-hooks.sh | Claude Flow V3 - Learning Hooks | Optional / inspect callers |
| .claude/helpers/learning-optimizer.sh | Claude Flow V3 - Learning Optimizer Worker | Optional / inspect callers |
| .claude/helpers/learning-service.mjs | /** * Claude Flow V3 - Persistent Learning Service * | Optional / inspect callers |
| .claude/helpers/memory.js | /** * Claude Flow Memory Helper * Simple key-value memory for cross-session context | Optional / inspect callers |
| .claude/helpers/metrics-db.mjs | /** * Claude Flow V3 - Metrics Database Manager * Uses sql.js for cross-platform SQLite storage | Optional / inspect callers |
| .claude/helpers/pattern-consolidator.sh | Claude Flow V3 - Pattern Consolidator Worker | Optional / inspect callers |
| .claude/helpers/perf-worker.sh | Claude Flow V3 - Performance Benchmark Worker | Optional / inspect callers |
| .claude/helpers/post-commit | Claude Flow Post-Commit Hook | Optional / inspect callers |
| .claude/helpers/pre-commit | Claude Flow Pre-Commit Hook | Optional / inspect callers |
| .claude/helpers/quick-start.sh | Quick start guide for Claude Flow | Optional / inspect callers |
| .claude/helpers/README.md | Claude Flow V3 Helpers | Optional / inspect callers |
| .claude/helpers/router.js | /** * Claude Flow Agent Router * Routes tasks to optimal agents based on learned patterns | Optional / inspect callers |
| .claude/helpers/security-scanner.sh | Claude Flow V3 - Security Scanner Worker | Optional / inspect callers |
| .claude/helpers/session.js | /** * Claude Flow Session Manager * Handles session lifecycle: start, restore, end | Optional / inspect callers |
| .claude/helpers/setup-mcp.sh | Setup MCP server for Claude Flow | Optional / inspect callers |
| .claude/helpers/standard-checkpoint-hooks.sh | Standard checkpoint hook functions for Claude settings.json (without GitHub features) | Dangerous if enabled; review first |
| .claude/helpers/statusline-hook.sh | Claude Flow V3 Statusline Hook | Optional / inspect callers |
| .claude/helpers/statusline.cjs | /** * RuFlo V3 Statusline Generator (Optimized) * Displays real-time V3 implementation progress and system status | Optional / inspect callers |
| .claude/helpers/statusline.js | /** * RuFlo Statusline Generator * Displays real-time V3 implementation progress and system status. | Optional / inspect callers |
| .claude/helpers/swarm-comms.sh | Claude Flow V3 - Optimized Swarm Communications | Optional / inspect callers |
| .claude/helpers/swarm-hooks.sh | Claude Flow V3 - Swarm Communication Hooks | Optional / inspect callers |
| .claude/helpers/swarm-monitor.sh | Claude Flow V3 - Real-time Swarm Activity Monitor | Optional / inspect callers |
| .claude/helpers/sync-v3-metrics.sh | Claude Flow V3 - Auto-sync Metrics from Actual Implementation | Optional / inspect callers |
| .claude/helpers/update-v3-progress.sh | V3 Progress Update Script | Optional / inspect callers |
| .claude/helpers/v3-quick-status.sh | V3 Quick Status - Compact development status overview | Optional / inspect callers |
| .claude/helpers/v3.sh | V3 Helper Alias Script - Quick access to all V3 development tools | Optional / inspect callers |
| .claude/helpers/validate-v3-config.sh | V3 Configuration Validation Script | Optional / inspect callers |
| .claude/helpers/worker-manager.sh | Claude Flow V3 - Unified Worker Manager | Optional / inspect callers |

# Appendix D — All 18 agent definitions

These are role prompts/config files, not proof of 18 active native workers.

| File | Description | Port |
| --- | --- | --- |
| .claude/agents/browser/browser-agent.yaml | Web automation specialist using agent-browser with AI-optimized snapshots | A |
| .claude/agents/consensus/byzantine-coordinator.md | Coordinates Byzantine fault-tolerant consensus protocols with malicious actor detection | A |
| .claude/agents/consensus/crdt-synchronizer.md | Implements Conflict-free Replicated Data Types for eventually consistent state synchronization | A |
| .claude/agents/consensus/gossip-coordinator.md | Coordinates gossip-based consensus protocols for scalable eventually consistent systems | A |
| .claude/agents/consensus/performance-benchmarker.md | Implements comprehensive performance benchmarking for distributed consensus protocols | A |
| .claude/agents/consensus/quorum-manager.md | Implements dynamic quorum adjustment and intelligent membership management | A |
| .claude/agents/consensus/raft-manager.md | Manages Raft consensus algorithm with leader election and log replication | A |
| .claude/agents/consensus/security-manager.md | Implements comprehensive security mechanisms for distributed consensus protocols | A |
| .claude/agents/core/planner.md | Strategic planning and task orchestration agent with AI-powered resource optimization | A |
| .claude/agents/sparc/architecture.md | SPARC Architecture phase specialist for system design with self-learning | A |
| .claude/agents/sparc/pseudocode.md | SPARC Pseudocode phase specialist for algorithm design with self-learning | A |
| .claude/agents/sparc/refinement.md | SPARC Refinement phase specialist for iterative improvement with self-learning | A |
| .claude/agents/sparc/specification.md | SPARC Specification phase specialist for requirements analysis with self-learning | A |
| .claude/agents/swarm/adaptive-coordinator.md | Dynamic topology switching coordinator with self-organizing swarm patterns and real-time optimization | A |
| .claude/agents/swarm/hierarchical-coordinator.md | Queen-led hierarchical swarm coordination with specialized worker delegation | A |
| .claude/agents/swarm/mesh-coordinator.md | Peer-to-peer mesh network swarm with distributed decision making and fault tolerance | A |
| .claude/agents/testing/production-validator.md | Production validation specialist ensuring applications are fully implemented and deployment-ready | A |
| .claude/agents/testing/tdd-london-swarm.md | TDD London School specialist for mock-driven development within swarm coordination | A |

# Appendix E — All 29 environment-provided skills outside the repository

These were listed by the Codex environment in this session; they are system/plugin skills, not all installed in the project and not all relevant to other projects. Install through the matching system/plugin mechanism if needed; do not copy private plugin-cache directories.

| Environment skill | Best use in a separate project |
| --- | --- |
| imagegen | Create/edit raster graphics |
| openai-docs | Current official OpenAI/Codex/API documentation |
| skill-creator | Build or update a reusable Codex skill |
| skill-installer | Install skills from curated sources |
| AgentDB Advanced Features | Advanced AgentDB synchronization and multi-agent integration |
| AgentDB Learning Plugins | Build/training AgentDB learning plugins |
| AgentDB Memory Patterns | Persistent agent memory patterns |
| AgentDB Performance Optimization | AgentDB indexing/quantization optimization |
| AgentDB Vector Search | Semantic vector search |
| DannFlow Masterplan & Architecture Orchestrator | DannFlow SaaS initialization and project board |
| DannFlow Task Orchestrator | DannFlow MASTERPLAN task lifecycle |
| DannFlow Upstream Synchronizer | Update old DannFlow-derived projects |
| Hooks Automation | Hook orchestration and cross-session automation |
| JuanStack Vertical Onboarding & DNA Configurator | JuanStack vertical-specific initialization |
| Pair Programming | Driver/navigator pair programming modes |
| ReasoningBank Intelligence | Adaptive agent-memory patterns |
| ReasoningBank with AgentDB | ReasoningBank backed by AgentDB |
| Skill Builder | Author Codex Skills |
| Swarm Orchestration | Multi-agent swarm coordination |
| V3 CLI Modernization | Codex-flow v3 CLI/hooks work |
| V3 Core Implementation | Codex-flow v3 core modules |
| V3 DDD Architecture | Codex-flow v3 domain architecture |
| V3 Deep Integration | Integrate agentic-flow with Codex-flow |
| V3 MCP Optimization | MCP transport/performance work |
| V3 Memory Unification | AgentDB memory unification |
| V3 Performance Optimization | Codex-flow v3 performance work |
| V3 Security Overhaul | Codex-flow v3 security architecture |
| V3 Swarm Coordination | Codex-flow v3 agent orchestration |
| Verification & Quality Assurance | Agent-output/code verification workflow |

# Appendix F — File map / reuse order

1. AGENTS.md: shared project rules; rewrite DannFlow-only rules.
2. CLAUDE.md and .codex/: host adapters and compatibility bridge.
3. .agents/skills/: canonical Codex project skill locations.
4. .claude/skills/: Claude-side mirrors.
5. .claude/agents/ and Codex .codex/agents/: host-specific agent definitions; do not copy between formats blindly.
6. .claude/commands/: 197 prompt/index files. Codex bridge loads these on demand; source commands remain Claude-oriented.
7. .claude/settings.json / .codex/hooks.json: event configuration; the referenced programs still need to exist, be compatible, trusted, and tested.
8. .claude/helpers/: optional 41 helper programs; only three .husky files are active Git hook entry points.
9. .husky/: actual local Git hook integration.
10. .github/workflows/: remote CI gate; verify branch protection separately.
11. install.sh / guide.sh: DannFlow project installer and setup guide, not generic add-on scripts.
12. .claude-flow/: Ruflo/Claude Flow runtime config/status; optional, environment-dependent, not verified running.
13. package.json / package-lock.json: application and tooling dependencies; separate runtime libraries from agent prompts.

# Appendix G — Current official references

- [Codex hooks](https://learn.chatgpt.com/docs/hooks)
- [Codex skills](https://learn.chatgpt.com/docs/build-skills)
- [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Claude hooks](https://code.claude.com/docs/en/hooks)
- [Claude subagents](https://code.claude.com/docs/en/sub-agents)
- [Skills CLI](https://github.com/vercel-labs/skills)
- [Husky setup](https://typicode.github.io/husky/get-started.html)
- [GitHub MCP in Codex](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-codex.md)
- [Supabase MCP](https://supabase.com/docs/guides/ai-tools/mcp)
- [Ruflo installation](https://github.com/ruvnet/ruflo/wiki/Installation)
