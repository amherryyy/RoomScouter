# Application Architecture

## System boundary

RoomScouter is a single Next.js application backed by Supabase Auth, PostgreSQL, and Storage. It is not a microservice system. Server-side application code owns trusted mutations and moderation orchestration; PostgreSQL constraints and row-level security remain the final authorization boundary.

```text
Mobile or desktop browser
          |
       Next.js
     /    |     \
 Auth  PostgreSQL  Storage
          |
   constraints + RLS
```

Flower governs generated framework integrations, validation, security configuration, and workflows. Product pages, domain rules, presentation, and project-specific migrations remain project-owned unless a future plan explicitly assigns ownership.

## Feature boundaries

```text
src/
  features/
    auth/
    profiles/
    listings/
    discovery/
    favorites/
    reviews/
    reports/
    moderation/
  lib/
    supabase/
    validation/
    permissions/
    distance/
  components/
```

Feature folders may contain their queries, commands, schemas, and components. Shared code must be genuinely cross-feature; a generic `utils` dumping ground is not part of the design.

## Domain model

| Table | Purpose | Important constraints |
| --- | --- | --- |
| `profiles` | Application identity linked one-to-one with `auth.users` | Role is student, owner, or admin. |
| `boarding_houses` | Core owner-controlled listing and moderation state | Non-negative rent and availability; valid coordinates; explicit status. |
| `listing_photos` | Ordered Storage objects for a listing | Unique object path and display position per listing. |
| `facilities` | Controlled facility vocabulary | Case-insensitive unique name. |
| `boarding_house_facilities` | Listing-to-facility relation | Unique pair. |
| `utilities` | Controlled utility vocabulary | Case-insensitive unique name. |
| `boarding_house_utilities` | Relation plus included/excluded state | Unique pair; explicit inclusion flag. |
| `house_rules` | Ordered, displayable rules | Unique position per listing. |
| `favorites` | Student's saved listings | Unique student/listing pair. |
| `reviews` | One rating and comment from a student | Unique student/listing pair; rating from one through five. |
| `reports` | Student-submitted moderation case | Target type and target ID must agree; explicit lifecycle status. |
| `moderation_events` | Append-only record of listing moderation outcomes | Actor, listing, action, timestamp, and non-sensitive reason. |

The core listing lifecycle is now established by the listing-foundation migration. Changes to its relationships or security boundaries require an architecture decision.

## Authorization and RLS contract

| Resource | Visitor | Student | Owner | Admin |
| --- | --- | --- | --- | --- |
| Approved listing data | Read | Read | Read | Read/all states |
| Owner's listing | — | — | Create/read/update own | Read/update/moderate |
| Listing photos and attributes | Read when listing is public | Same as visitor | Manage own | Manage/moderate |
| Favorite | — | Manage own | — | Read only when required for support; normally denied |
| Review | Read published | Manage own | Read published | Moderate |
| Report | — | Create/read own | Create/read own reports if enabled later | Read and resolve |
| Profile | — | Read/update safe own fields | Read/update safe own fields | Read and administer permitted fields |
| Moderation event | — | — | Read events concerning own listings where safe | Create/read |

Policies follow deny-by-default rules. The browser never receives a service-role credential. Role checks based only on client state are insufficient. Admin assignment cannot be self-selected during registration; a restricted, idempotent database function is executable only by a privileged PostgreSQL operator.

Password recovery uses Supabase's PKCE email flow and the allow-listed application callback. Recovery requests return the same response whether an account exists or not. Only an authenticated recovery session may reach the password-update form, and a successful change revokes refresh-token sessions before requiring a new login. See [ADR 0020](decisions/0020-password-recovery.md).

## Location and distance

Every listing stores latitude and longitude. Version 0.1 stores one configured university coordinate and computes approximate straight-line distance using the Haversine formula. This supports consistent filtering without GPS tracking or route-provider dependence. Display text must label the value as approximate; travel time and road distance are out of scope.

## Search

Filtering is performed by database queries with pagination. The browser must not download the full listing table to filter locally. Initial indexes should support publication status, price, available rooms, room type, owner, and common join filters. Text search begins with PostgreSQL-supported matching and can evolve only after measured need.

## Uploads

Listing photos use a private-by-default Supabase Storage bucket with explicit read rules for approved listings and owner/admin write rules. Upload validation follows `.flower/uploads.json`. Database rows store object paths rather than public credentials or trusted external URLs.

## Configuration

Public Supabase URL and anonymous key may be exposed through approved public environment variables. Service credentials, if introduced later for a reviewed server-only operation, must never use the browser client. University identity and coordinates are deployment configuration and validated on startup or build.

Hosted rehearsal additionally requires the canonical RoomScouter site origin. A fail-closed release check validates clean HTTPS application and Supabase origins, the browser key class, and university configuration before the build. Vercel application rollback and Supabase migration recovery remain separate operations. See [ADR 0019](decisions/0019-fail-closed-deployment-rehearsal.md).

## Testing strategy

- Unit tests cover validation, distance calculations, and domain transitions.
- Ephemeral PostgreSQL tests apply the real migrations and prove grants, triggers, constraints, and RLS behavior for visitor, student, owner, and admin actors.
- Integration tests cover server-side commands and query composition.
- A serial, local-only Playwright suite covers student discovery and community actions, owner submission, and administrator listing/review/report moderation. The runner reseeds fixed fictional data and refuses non-loopback Supabase endpoints. See [ADR 0018](decisions/0018-local-browser-acceptance-tests.md).
- Accessibility contract tests protect landmarks, feedback semantics, form guidance, focus, and narrow-layout behavior; the pilot checklist adds keyboard, zoom, and forced-colors review.
- Flower validation and security checks guard framework contracts and repository policy.

Local demonstrations use an explicit guarded seed command rather than migration or automatic reset data. It accepts credentials only from the loopback Supabase stack, recreates fixed fictional scenarios, and cannot target the linked hosted project.

## Implementation sequence

Identity, administrator provisioning, listing data, owner workflows, public discovery, community actions, and the core administration workflows are complete. Listing moderation, review moderation, and report resolution use admin-only workspaces backed by transactional database commands. Accessibility contracts, deterministic demo data, local browser acceptance coverage, deployment checks, and a repeatable demonstration script now form the Version 0.1 pilot-hardening baseline.
