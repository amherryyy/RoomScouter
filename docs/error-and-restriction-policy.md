# Errors and Restrictions Policy

This document consolidates the current RoomScouter permissions, field limits, and error-handling rules. Limits listed here describe the application and database contract as it exists in the repository. Product decisions marked **Open** are intentionally not enforced until the team chooses a value.

## Authorization rules

A hidden button is not an authorization boundary. Every protected operation must check the signed-in user and role in the server action, and database row-level security (RLS), constraints, grants, and storage policies must enforce the same boundary for direct API calls.

| Actor | Allowed | Restricted |
| --- | --- | --- |
| Visitor | Browse approved listings with available rooms and published reviews. View listing contact channels shown publicly. | Cannot write application data. |
| Student | Manage their own favorites; create, edit, or delete their own review; report a listing or review; view their own reports. | One favorite per listing and one review per listing. Cannot manage owner listings or another user's content. Cannot edit or delete a submitted report. One open report per reporter and target. |
| Owner | Create and edit their own listing; submit eligible drafts or rejected listings for moderation; change their own room availability; manage their listing attributes and photos. | Cannot manage another owner's listing. Cannot set moderation status directly, bypass review, or hard-delete a listing. Material edits to an approved listing return it to moderation; availability changes do not. |
| Administrator | Moderate listings and reviews; access and resolve reports; manage listing content as permitted by admin policies. | Admin status cannot be self-assigned during registration. Administrative changes must use the authorized moderation paths and preserve audit history. |

Role and ownership checks must use trusted server/database identity and profile data. Do not authorize actions from user-editable metadata, client-supplied owner IDs, or UI visibility alone. Keep grants least-privilege and enable RLS on exposed tables.

## Current input limits

Lengths are measured after trimming where the server/database contract trims whitespace. The server and database are authoritative; browser `minLength`, `maxLength`, and `required` attributes improve usability but do not replace validation.

| Data | Current restriction |
| --- | --- |
| Profile display name | 1–80 characters. |
| Password | 8–128 characters in application signup, password update, and reset validation. Supabase Auth minimum is aligned to 8 in `supabase/config.toml`. |
| Listing title | 3–120 characters. |
| Listing description | 20–5,000 characters. |
| Address line | 5–240 characters. Barangay: 2–80 characters. |
| Monthly rent | Non-negative, stored to 2 decimal places in `numeric(10,2)` (maximum 99,999,999.99). |
| Available rooms | Integer from 0 through 1,000. |
| Listing contact name | 1–80 characters. At least one of phone or email is required. |
| Listing contact phone | 7–30 characters; no country-specific format is enforced. |
| Listing contact email | At most 254 characters and checked for basic email syntax. |
| Coordinates | Latitude −90 to 90 and longitude −180 to 180, up to 6 decimal places. No service-area boundary is currently enforced. |
| Utility details | Up to 240 characters. |
| House rules | Each rule 3–500 characters. The owner UI accepts up to 10 rules; the database position constraint currently permits up to 100. |
| Listing photos | JPEG or PNG; 1 byte to 10 MiB each; at most 10 photos per listing. Alternative text is 3–200 characters. |
| Review | Integer rating 1–5; comment 3–2,000 characters; one review per student/listing. |
| Report reason | 10–1,000 characters; one open report per reporter and target. |
| Moderation/resolution notes | Listing non-approval reason: 5–1,000 characters in the UI. Review moderation and report resolution notes: 3–1,000 characters in the UI. Database checks remain the final write boundary. |

## Error behavior

Errors shown to a user should explain the next useful action without exposing credentials, private records, SQL, stack traces, storage paths, or internal infrastructure details.

- **Invalid input:** keep the user on the form, identify the field or rule, and preserve safe entered values when practical.
- **Not signed in:** send the user to sign in before continuing.
- **Wrong role or ownership:** deny the operation and direct the user to an appropriate route; do not reveal another user's private data.
- **Not found or unavailable:** return a generic unavailable/not found state when revealing existence would expose private information.
- **Duplicate or uniqueness conflict:** explain that the item already exists or refresh/retry where appropriate.
- **Concurrent update:** tell the user the record changed and ask them to refresh and retry (the availability workflow already uses this pattern).
- **Auth credentials:** use a generic incorrect email/password message. Password recovery must not disclose whether an email has an account.
- **Expired/invalid verification code:** ask the user to request a new code.
- **Rate limit:** state that the user should wait before retrying.
- **Unexpected service/database/storage error:** log only minimal diagnostic context on the server; show a generic retry/support message. Never log passwords, verification codes, contact details, addresses, or full request bodies.

Prefer inline field errors for form validation. Use a consistent page-level error state for authorization, missing records, and service failures. Errors must remain understandable when query-string parameters or actions are used to carry them; avoid inconsistent, raw backend messages.

## Enforcement and maintenance

1. Validate every mutation on the server, including values submitted without the browser UI.
2. Enforce ownership, role, uniqueness, ranges, and state transitions again in database policies, constraints, and narrowly scoped functions.
3. Keep storage file type, size, path ownership, and listing visibility policies aligned with the listing/photo rules above.
4. When changing a limit or permission, update the UI, server parser/action, database policy/constraint, this document, and relevant acceptance criteria together.
5. Do not add a listing-count cap, Bayombong/NVSU service-area fence, or regional phone-number format until a product decision sets the rule and its user-facing error.

## Open product decisions

- **Listing-count cap:** no per-owner maximum is currently enforced.
- **Service area:** coordinates are only checked against global latitude/longitude ranges.
- **Phone format:** length and basic presence are checked; no Philippine-specific normalization/verification is applied.
- **House-rule count:** UI limit is 10 while the database permits positions through 100; decide whether to align the database to 10.
- **Password requirements:** the minimum is 8; no mandatory mixed-case, number, or symbol rule is configured.
