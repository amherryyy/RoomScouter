# RoomScouter

RoomScouter is a mobile-first web application that helps students discover and compare boarding houses near one university. Owners maintain listings, while administrators approve listings and moderate community content.

This repository is the first external pilot application for the independent Flower framework. Flower supplies the project contract, security baseline, transactional module operations, validation, and agent workflows; the product code and domain decisions remain owned by this repository.

## Pilot goal

Version 0.1 must prove five things:

1. Owners can create and maintain boarding-house listings.
2. Students can find listings using useful filters.
3. Students can compare price, distance, facilities, utilities, and availability.
4. Students can see where a boarding house is relative to the university.
5. Administrators can keep published information trustworthy.

The complete scope is defined in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), functional requirements in [docs/requirements.md](docs/requirements.md), and technical boundaries in [docs/architecture.md](docs/architecture.md). Findings discovered while using Flower are recorded in [docs/pilot-findings.md](docs/pilot-findings.md).

## Local development

```powershell
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

Before committing changes, run:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

`npm.cmd test` creates an ephemeral in-process PostgreSQL database, applies the real identity migration, and exercises its grants, triggers, roles, and row-level security. It does not require Docker, a local Supabase service, network access, or database credentials.

Never commit `.env.local` or Supabase service-role credentials.

## Supabase identity setup

The identity foundation requires a Supabase project before registration can run:

1. Copy `.env.example` to `.env.local` and provide the project's URL and publishable key.
2. Apply `supabase/migrations/20260926010000_identity_foundation.sql` through the reviewed database-migration workflow.
3. Configure the local and deployed site URLs and redirect allow-list in Supabase Auth before testing email confirmation. The registration flow uses the default confirmation template and exchanges its PKCE code at `/auth/callback`; custom SMTP is not required for development.
4. Regenerate `src/lib/supabase/database.types.ts` from the linked project after every migration with `npm run types:database`. The project command writes UTF-8 consistently, including from Windows PowerShell.

Registration permits only student and owner accounts. Public registration cannot create an administrator.

To provision an administrator, first let that person register and confirm their account. Apply all pending migrations, then run the following from a privileged database session such as the Supabase SQL Editor:

```sql
select public.provision_admin('administrator@example.com');
```

The operation is repeatable and returns the promoted user's ID. It fails when the email has no authentication account or profile. Application roles (`anon` and `authenticated`) cannot execute it, and no service-role credential is required by the application. See [ADR 0005](docs/decisions/0005-privileged-admin-provisioning.md).

## Listing lifecycle

Owners create draft boarding houses and submit them with `submit_boarding_house`. Administrators approve, reject, or archive them with `moderate_boarding_house`. Public queries expose only approved listings with at least one available room. Material owner edits return approved listings to pending review, while availability-only edits preserve approval. The database rules and rationale are documented in [ADR 0006](docs/decisions/0006-listing-lifecycle-enforcement.md).
