# ADR 0003: RoomScouter product brand

- Status: Accepted
- Date: 2026-09-27

## Context

The original working name, Boarding House Finder, described the function but was not intended to be the final product identity. The repository is still pre-release, so this is the least disruptive point to establish a distinct name.

Flower protects project metadata through migration-only ownership. Its update application is not yet available, so changing the protected manifest directly would violate the framework contract.

## Decision

The product, repository, interface, documentation, and npm package use the name **RoomScouter**. The stable internal Flower project identifier remains `boarding-house-finder`. The protected Flower display name retains its original value until Flower can apply a reviewed metadata migration.

## Consequences

- The future GitHub repository and preferred local directory are named `RoomScouter`.
- Product-facing text must use RoomScouter.
- Existing migration filenames, Git commits, and the stable Flower identifier are not rewritten.
- No feature scope, user role, database relationship, or security decision changes because of the rename.
