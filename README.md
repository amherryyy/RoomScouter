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

Registration permits only student and owner accounts. The first administrator must be assigned through a privileged deployment operation; the public registration flow cannot create an admin.
