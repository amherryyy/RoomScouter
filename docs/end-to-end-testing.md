# Local end-to-end testing

The Playwright suite checks the three connected journeys that make RoomScouter useful:

1. A student searches for a listing, saves it, publishes a review, and reports another review.
2. An owner creates a listing and submits it for approval.
3. An administrator approves that listing, hides the test review, resolves the test report, and confirms that the approved listing is public.

## First-time setup

Install the Chromium browser used by Playwright from the repository root:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD\.playwright-browsers"
npx.cmd playwright install chromium
```

Docker Desktop must be running, and the local Supabase services must already exist:

```powershell
npx.cmd supabase start
npx.cmd supabase db reset --local
```

## Run the journeys

```powershell
npm.cmd run test:e2e:local
```

The runner reads credentials directly from `supabase status -o env`, rejects every API endpoint except `http://127.0.0.1:54321` or its `localhost` equivalent, and reseeds the fixed fictional demo scenario. It builds the app with those local values, starts a production server at `http://127.0.0.1:3100`, and runs one Chromium worker so the role journeys remain deterministic without development compilation delays.

The seed refreshes the known demo records. Do not use this command when you need to preserve edits made to those fictional local records.

Failure screenshots, videos, and traces are written to ignored Playwright output directories. Open the HTML report with:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD\.playwright-browsers"
npx.cmd playwright show-report
```

The normal `npm.cmd test` suite remains independent of Docker and browsers. This local end-to-end command is the live acceptance check used before a pilot release.
