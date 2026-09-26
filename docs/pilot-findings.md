# Flower Pilot Findings

This ledger records evidence from using Flower in a real application. A finding is not automatically a framework requirement; it must be reproduced and resolved in the repository that owns the affected policy or behavior.

## FPF-001: Generated project fails its initial license gate

- Status: Open
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

Do not weaken the application policy silently. Flower should decide whether the template intentionally permits these dependencies and whether the checker must parse SPDX expressions instead of comparing the complete expression as an opaque string. After that reviewed decision, the template and pilot baseline can be updated together.

### Acceptance

A newly initialized unchanged project passes `flower security check`, or initialization explicitly reports a reviewed policy decision that the user must complete before the project is considered secure.
