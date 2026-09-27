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
| `moderation_events` | Append-only record of admin outcomes | Actor, target, action, timestamp, and non-sensitive reason. |

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

## Location and distance

Every listing stores latitude and longitude. Version 0.1 stores one configured university coordinate and computes approximate straight-line distance using the Haversine formula. This supports consistent filtering without GPS tracking or route-provider dependence. Display text must label the value as approximate; travel time and road distance are out of scope.

## Search

Filtering is performed by database queries with pagination. The browser must not download the full listing table to filter locally. Initial indexes should support publication status, price, available rooms, room type, owner, and common join filters. Text search begins with PostgreSQL-supported matching and can evolve only after measured need.

## Uploads

Listing photos use a private-by-default Supabase Storage bucket with explicit read rules for approved listings and owner/admin write rules. Upload validation follows `.flower/uploads.json`. Database rows store object paths rather than public credentials or trusted external URLs.

## Configuration

Public Supabase URL and anonymous key may be exposed through approved public environment variables. Service credentials, if introduced later for a reviewed server-only operation, must never use the browser client. University identity and coordinates are deployment configuration and validated on startup or build.

## Testing strategy

- Unit tests cover validation, distance calculations, and domain transitions.
- Ephemeral PostgreSQL tests apply the real migrations and prove grants, triggers, constraints, and RLS behavior for visitor, student, owner, and admin actors.
- Integration tests cover server-side commands and query composition.
- End-to-end tests cover the owner-submit, admin-approve, and student-discover flows.
- Flower validation and security checks guard framework contracts and repository policy.

## Implementation sequence

Identity and administrator provisioning are complete. The listing foundation establishes the owner, publication, moderation, and audit boundaries before listing forms or discovery UI are introduced. Attribute, photo, owner-workflow, and discovery slices build on these tested database contracts.
