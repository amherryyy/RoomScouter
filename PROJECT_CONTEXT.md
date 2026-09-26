# Project Context

## Product

Boarding House Finder centralizes reliable information about boarding houses near a single university. It replaces scattered social-media posts, private messages, word of mouth, and physical advertisements with searchable, moderated listings.

The initial deployment serves one university and its nearby area. The university's name, latitude, and longitude are deployment configuration and must be supplied before the map milestone is considered complete.

## Users

### Visitor

A visitor may browse, search, filter, and view approved listings. Authentication is required for personal or user-generated activity.

### Student

A student may do everything a visitor can, save favorites, submit one review per listing, and report incorrect or inappropriate information. A student may change or remove only their own favorites, reviews, and reports where the workflow permits it.

### Owner

An owner may create listings, upload listing photos, maintain their own listing details and availability, and submit listings for approval. An owner cannot publish a listing, edit another owner's listing, or moderate community content.

### Admin

An administrator may review and approve or reject listings, archive inappropriate listings, handle reports, moderate reviews, and view the user information needed for moderation. Administrative actions must be auditable.

## Version 0.1 scope

The pilot includes:

- email-based registration, login, and logout;
- explicit student, owner, and admin roles;
- owner-managed boarding-house listings and photos;
- monthly rent, room type, available-room count, contact details, and availability;
- facilities, utilities, house rules, and inclusion details;
- an approval workflow before public publication;
- browsing, text search, price, distance, availability, room-type, facility, and utility filters;
- a map position and approximate distance from the configured university;
- student favorites, simple one-to-five-star reviews, and reports;
- admin queues for listings, reports, and reviews;
- responsive behavior suitable for common mobile browsers.

## Explicit non-goals

Version 0.1 does not include payments, reservations, contracts, identity-document verification, real-time chat, AI recommendations, roommate matching, recommendation algorithms, advanced analytics, GPS tracking, or support for multiple universities.

Owner contact information is displayed according to the listing's publication rules. “Respond to inquiries” means responding through the published contact channel; the pilot does not implement an internal messaging system.

## Success criteria

The pilot succeeds when a demonstration can show an owner submitting a listing, an administrator approving it, and a student finding, comparing, mapping, favoriting, reviewing, and reporting that listing without any user gaining access to another user's protected data.

## Product principles

- Prefer a small complete workflow over many incomplete features.
- Treat moderation and row-level authorization as core behavior, not later polish.
- Store only information required by the pilot.
- Make important listing facts comparable and readable on a phone.
- Keep domain code modular without turning each feature into an independent service.
