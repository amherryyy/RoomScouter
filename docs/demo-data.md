# Local pilot demo data

RoomScouter provides a repeatable local dataset for demonstrations and end-to-end development. It never reads `.env.local` or linked-project credentials. The seed command obtains credentials from the currently running local Supabase stack and refuses any API URL other than `http://127.0.0.1:54321` or `http://localhost:54321`.

## Prepare the local stack

Docker Desktop must be running. From the repository root:

```powershell
npx.cmd supabase start
npx.cmd supabase db reset
npm.cmd run demo:seed
```

Configure the web application to use the local `API_URL` and publishable or anonymous key shown by:

```powershell
npx.cmd supabase status -o env
```

Do not place the service-role or secret key in `.env.local`; the browser application never needs it.

## Demo accounts

All accounts use the local-only password `RoomScouterDemo!2026`.

| Role | Email | Demonstrates |
| --- | --- | --- |
| Student | `student@roomscouter.example.test` | Discovery, favorites, reviews, and reports |
| Second student | `student2@roomscouter.example.test` | Multiple reviews and independent report ownership |
| Owner | `owner@roomscouter.example.test` | Listing maintenance and a pending submission |
| Administrator | `admin@roomscouter.example.test` | Listing, review, and report moderation |

The fictional dataset includes three approved listings, one pending listing, controlled attributes, house rules, reviews, favorites, moderation history, and two open reports around the configured NVSU Bayombong campus coordinates. Names, addresses, contacts, and descriptions are demonstrative rather than claims about real businesses.

## Repeatability and cleanup

Running `npm.cmd run demo:seed` again refreshes the four demo accounts, deletes only records bearing the fixed demo identifiers, and recreates the expected scenario. `npx.cmd supabase db reset` removes all local data, reapplies migrations, and leaves demo seeding as an explicit separate step.

The seed command must fail before any mutation when local Supabase is not running or when the discovered API endpoint is not the expected local endpoint.
