# Deployment rehearsal

Vercel and the hosted Supabase project are already configured for the current RoomScouter pilot. Use this guide to verify existing settings or prepare a future preview/production deployment. Do not re-import or recreate the configured projects as routine setup. Keep database changes in the reviewed Supabase migration workflow.

## 1. Confirm the database

From the intended release branch and with the correct Supabase project linked, verify that the hosted project has every reviewed migration:

```powershell
npx.cmd supabase migration list
npx.cmd supabase db push --dry-run
```

The local and remote migration columns should match. A production rehearsal should not continue when the dry run proposes an unexpected migration.

## 2. Configure Vercel

In the existing Vercel project, verify the repository connection and normal install/build commands. Verify the following values separately for Preview and Production:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Hosted project URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key, or legacy anon key; never a secret/service-role key |
| `ROOMSCOUTER_SITE_URL` | Exact public Vercel origin; production is `https://room-scouter.vercel.app` |
| `ROOMSCOUTER_UNIVERSITY_NAME` | `Nueva Vizcaya State University Bayombong Campus` |
| `ROOMSCOUTER_UNIVERSITY_LATITUDE` | `16.479791986946516` |
| `ROOMSCOUTER_UNIVERSITY_LONGITUDE` | `121.1432206694793` |

Run `npm.cmd run deployment:check` in a local shell configured with the same values, or `npm.cmd run release:check` for the full pre-release verification. The checker prints only origins, the key type, and university configuration; it never prints the key.

## 3. Configure Supabase Auth

In the hosted Supabase dashboard:

1. Confirm the production Site URL matches the exact `ROOMSCOUTER_SITE_URL` value.
2. Add `<ROOMSCOUTER_SITE_URL>/auth/callback` to the permitted redirect URLs.
3. Add a preview callback only when that preview will be used for authentication testing.
4. Keep email confirmation enabled. Registration requires a six digit code entered at `/verify-email`; its template must include Supabase's `{{ .Token }}` value from `supabase/templates/confirmation.html`.
5. Verify the existing SMTP sender configuration and provider rate limits. If setting up a new sender, use **Authentication > Emails > SMTP Settings**, verify the sender domain, and publish the provider's SPF, DKIM, and DMARC records. Keep authentication email separate from marketing email.
6. In **Authentication > Emails > Email Templates**, keep the confirmation template aligned with `supabase/templates/confirmation.html` and the password recovery template aligned with `supabase/templates/recovery.html`. Registration uses a code; password recovery still uses the `{{ .ConfirmationURL }}` PKCE link through `/auth/callback`.

For local development, `supabase/config.toml` enables confirmations, six digit OTPs, and matching templates. Supabase's local email inbox captures those messages; open the **Inbucket URL** reported by `npx.cmd supabase status` (normally `http://127.0.0.1:54324`) to inspect the code or recovery link. Local demo accounts are already confirmed so guarded Playwright journeys remain deterministic.

Do not place a database password, secret key, or service-role key in Vercel browser-visible variables.

## 4. Deploy and smoke-test

After Vercel reports a successful deployment, check the deployed origin in a private browser window:

- the home page loads over HTTPS and shows approved listings only;
- search and filters work, including approximate distance from the configured university;
- street/satellite map layers, the NVSU marker, barangay labels, listing markers, and map full-screen control work;
- listing details show approximate walking, bicycle, and tricycle times with their disclaimer;
- a confirmed student can log in, save a listing, and log out;
- an owner can reach the owner dashboard but not administrator pages;
- an administrator can reach moderation pages;
- an unauthenticated visitor is redirected away from protected pages;
- browser developer tools show no secret credentials and no failed requests to localhost;
- security headers are present on the deployed response.

Use disposable, clearly labelled rehearsal records. Do not copy the local demo seed into the hosted project.

## 5. Rollback rule

If a smoke check fails, leave the previous Vercel production deployment active or promote it again through Vercel. Diagnose the preview deployment, fix the repository through a reviewed branch, and rerun the checks. Database migrations are not rolled back by a Vercel rollback; every production migration therefore requires its own reviewed recovery plan before application.

Record the deployed URL, Git commit, migration-list result, tester, date, and smoke-check outcome in the release notes. No deployment is considered rehearsed from a successful build alone.
