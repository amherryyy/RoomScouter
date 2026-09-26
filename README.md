# Boarding House Finder

Boarding House Finder is a mobile-first web application that helps students discover and compare boarding houses near one university. Owners maintain listings, while administrators approve listings and moderate community content.

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

Never commit `.env.local` or Supabase service-role credentials.
