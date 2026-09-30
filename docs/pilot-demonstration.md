# RoomScouter pilot demonstration

This script gives the team a simple, repeatable presentation of the Version 0.1 pilot. Allow about ten minutes.

## Before the presentation

1. Start Docker Desktop and local Supabase.
2. Run `npm.cmd run test:e2e:local` and confirm that all three journeys pass.
3. Run `npm.cmd run demo:seed` once more to restore the starting scenario.
4. Start RoomScouter with the local Supabase public values and university configuration.
5. Open one normal browser window and one private window.

All local demo accounts use `RoomScouterDemo!2026`. The complete account list is in [demo-data.md](demo-data.md).

## Presentation story

### 1. Public discovery

- Open the home page without logging in.
- Explain that only approved listings with available rooms appear.
- Search for `Campus Gate Residences`.
- Show rent, availability, room type, facilities, utilities, house rules, approximate university distance, map link, and owner contact details.

### 2. Student experience

- Log in as `student@roomscouter.example.test`.
- Save a listing and open the saved-listings page.
- Publish or update a simple review.
- Submit a report and show that it appears only in that student's private report history.
- Explain that another student cannot see these saved items or private cases.

### 3. Owner workflow

- Log out and sign in as `owner@roomscouter.example.test`.
- Open the owner dashboard and the pending `Quezon Corner Boarding House` submission.
- Show its lifecycle state, listing editor, attributes, and photo controls.
- Explain that owners can manage only their own listings and cannot publish directly.

### 4. Administrator workflow

- Log out and sign in as `admin@roomscouter.example.test`.
- Open listing moderation and inspect the pending submission.
- Approve or reject it while explaining that the decision is recorded.
- Open review moderation and the report queue to show their separate outcomes and notes.

### 5. Trust and safety summary

Close by explaining three protections in plain language:

- the database—not just hidden buttons—enforces who may read or change each record;
- listings are private until an administrator approves them;
- RoomScouter does not process payments, reservations, private messages, or identity documents.

## Expected ending

The audience should have seen one complete chain: an owner supplies information, an administrator controls publication, and a student can discover and evaluate the approved result without crossing another user's private boundaries.

If the live demonstration becomes unreliable, show the successful Playwright HTML report and continue with the seeded pages. Do not switch to the hosted database or weaken authentication to rescue a presentation.
