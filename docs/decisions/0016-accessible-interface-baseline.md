# ADR 0016: Apply one accessibility baseline across all pilot workflows

- Status: Accepted
- Date: 2026-09-30

## Context

The pilot now has complete student, owner, and administrator workflows. Fixing accessibility page by page would create inconsistent focus, landmarks, responsive behavior, and status communication, while relying on visual inspection alone would make regressions easy.

## Decision

Adopt one application-wide baseline: a skip link and main target on every page, visible high-contrast keyboard focus, semantic alert and status feedback, current-page state for queue navigation, associated form guidance, meaningful image and external-link text, forced-colors support, and layouts that remain usable at 360 pixels and 200% zoom.

Protect these invariants with source-level contract tests and retain a documented manual matrix for keyboard, screen-reader, zoom, and high-contrast checks. Formal conformance certification is outside the pilot scope.

## Consequences

- Core workflows share predictable keyboard and assistive-technology behavior.
- Mobile and zoomed layouts avoid navigation and pagination overflow.
- New pages must expose the common main-content target and feedback semantics.
- Manual checks remain necessary because static tests cannot prove rendered accessibility or usability.
