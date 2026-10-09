# Deployment rehearsal

This rehearsal prepares RoomScouter for Vercel while keeping database changes in the reviewed Supabase migration workflow. Complete it first with a Vercel preview, then repeat the same checks for production.

## 1. Confirm the database

From a clean `main` branch, verify that the linked Supabase project has every reviewed migration:

```powershell
npx.cmd supabase migration list
npx.cmd supabase db push --dry-run
```

The local and remote migration columns should match. A production rehearsal should not continue when the dry run proposes an unexpected migration.

## 2. Configure Vercel

Import the GitHub repository into Vercel as a Next.js project. Keep the normal install and build commands. Add these values separately to Preview and Production:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Hosted project URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key, or legacy anon key; never a secret/service-role key |
| `ROOMSCOUTER_SITE_URL` | Exact public Vercel origin, such as `https://roomscouter.example` |
| `ROOMSCOUTER_UNIVERSITY_NAME` | `Nueva Vizcaya State University Bayombong Campus` |
| `ROOMSCOUTER_UNIVERSITY_LATITUDE` | `16.479791986946516` |
| `ROOMSCOUTER_UNIVERSITY_LONGITUDE` | `121.1432206694793` |

Run `npm.cmd run deployment:check` in a local shell configured with the same values, or `npm.cmd run release:check` for the full pre-release verification. The checker prints only origins, the key type, and university configuration; it never prints the key.

## 3. Configure Supabase Auth

In the hosted Supabase dashboard:

1. Set the production Site URL to the exact `ROOMSCOUTER_SITE_URL` value.
2. Add `<ROOMSCOUTER_SITE_URL>/auth/callback` to the permitted redirect URLs.
3. Add a preview callback only when that preview will be used for authentication testing.
4. Keep email confirmation enabled for the release rehearsal.
5. Configure a custom SMTP service under **Authentication > Emails > SMTP Settings**. Supabase's built-in sender is for development, only sends to project team members, and is limited to two emails per hour. A custom SMTP connection works with providers such as Resend, Amazon SES, Postmark, SendGrid, and Brevo. New custom SMTP setups start at 30 auth emails per hour; adjust **Authentication > Rate Limits** to a value supported by both Supabase and the provider.
6. Verify the sender domain with the provider and publish its SPF, DKIM, and DMARC DNS records. Use a dedicated authentication sender address and keep auth email separate from marketing email.
7. In **Authentication > Emails > Email Templates**, configure the confirmation and password recovery templates using the content in `supabase/templates/confirmation.html` and `supabase/templates/recovery.html`. Keep the Supabase `{{ .ConfirmationURL }}` link: registration and recovery already route through RoomScouter's allow-listed PKCE callback. This pilot uses links; an OTP code-entry screen would require a separate app flow.

For local development, `supabase/config.toml` enables confirmations and defines matching templates. Supabase's local email inbox captures those messages; open the **Inbucket URL** reported by `npx.cmd supabase status` (normally `http://127.0.0.1:54324`) to inspect and click the links. Local demo accounts are created as already confirmed so the guarded Playwright journeys remain deterministic.

Do not place a database password, secret key, or service-role key in Vercel browser-visible variables.

## 4. Deploy and smoke-test

After Vercel reports a successful deployment, check the deployed origin in a private browser window:

- the home page loads over HTTPS and shows approved listings only;
- search and filters work, including distance from the configured university;
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
