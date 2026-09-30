# ADR 0015: Resolve reports through a single terminal command

- Status: Accepted
- Date: 2026-09-30

## Context

Reports are private moderation cases with an open, resolved, or dismissed state. Their schema already reserves the responsible administrator, closure time, and outcome note, but direct updates would not enforce administrator identity, terminal transitions, or consistent explanations.

## Decision

Expose one security-definer command that locks an open report and permits an administrator to mark it resolved or dismissed. Every outcome requires a bounded note and records the authenticated administrator and timestamp atomically on the report.

An outcome is terminal and cannot be replaced. The report row itself is the audit record because it preserves the original student reason together with the final outcome and responsible administrator. A paginated admin workspace displays current listing or review context without exposing the reporter's identity.

## Consequences

- Students continue to see their report and the administrator's final response.
- Duplicate open-report protection permits a new report for the same target only after the earlier case closes.
- Concurrent administrators cannot assign conflicting outcomes to one report.
- Listing and review enforcement remain explicit moderation actions rather than automatic side effects of resolving a report.
