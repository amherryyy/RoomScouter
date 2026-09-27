# Flower Pilot Findings

This ledger records evidence from using Flower in a real application. A finding is not automatically a framework requirement; it must be reproduced and resolved in the repository that owns the affected policy or behavior.

## FPF-001: Generated project fails its initial license gate

- Status: Fixed upstream; pilot migration pending
- Severity: Blocks the declared security check
- Owner: Flower template/security policy
- Observed: 2026-09-26

### Evidence

A fresh `next-supabase` initialization completes its tests, type-check, lint, build, and structural Flower validation. Running `flower security check` immediately afterward reports licenses from Next.js transitive packages that are absent from the generated allowlist:

- `LGPL-3.0-or-later` for platform-specific Sharp/libvips packages;
- `Apache-2.0 AND LGPL-3.0-or-later` variants;
- `Apache-2.0 AND LGPL-3.0-or-later AND MIT` for the Sharp WASM package;
- `CC-BY-4.0` for `caniuse-lite`.

### Decision pending

Do not weaken the application policy silently. Flower reviewed the exact dependency licenses in ADR 0039 and merged the corrected template in Flower PR #24. The checker intentionally continues comparing complete SPDX expressions as exact policy values.

This pilot predates that corrected template. Its security baseline is protected with the `migration-engine-only` ownership policy, and Flower's user-facing update application is not implemented yet. The pilot therefore retains the original baseline and the security check remains blocked by these known diagnostics. Do not edit the protected file manually; migrate it through Flower's update application when available, or perform an explicitly reviewed pilot reinitialization while the project is still pre-release.

### Acceptance

A newly initialized unchanged project passes `flower security check`, or initialization explicitly reports a reviewed policy decision that the user must complete before the project is considered secure.

## FPF-002: Protected project display name cannot be migrated yet

- Status: Update application pending
- Severity: Does not block product development
- Owner: Flower update application
- Observed: 2026-09-27

### Evidence

The pilot changed its product and repository brand from Boarding House Finder to RoomScouter before release. Product-owned documentation, interface text, and npm package metadata can be renamed normally. Flower's internal project identifier and display name are protected by the `migration-engine-only` ownership policy, but the user-facing update application needed to migrate that metadata is not implemented yet.

### Current disposition

The stable Flower identifier remains `boarding-house-finder`; identifiers are not required to match branding. The protected Flower display name also retains its original value until a reviewed migration is available. Product code must use RoomScouter. Do not edit `.flower/project.json` manually.

### Acceptance

Flower can plan and transactionally apply a project-display-name migration while preserving the stable project identifier, ownership rules, journal evidence, and rollback behavior.
