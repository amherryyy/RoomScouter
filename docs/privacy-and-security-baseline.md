# RoomScouter privacy and security baseline (pilot)

**Status:** implementation and launch checklist, prepared 2026-10-09. This is not evidence of institutional adoption or a legal compliance certification.

## What the repository establishes

- Supabase Auth handles email/password authentication and session refresh. Profiles contain display name and role.
- PostgreSQL row-level security and role checks scope private profiles, favorites, reports, drafts, and moderator workflows. Approved listings and published reviews are public by design.
- Listing contact details and exact property address/coordinates can be public. Listing photos are stored in the private `listing-photos` bucket and served by short-lived signed URLs.
- The application does not request visitor GPS, identity documents, payment data, or school records. No analytics or advertising integration is present in the package manifest or application source found during this review.
- Listing pages link to OpenStreetMap on click; no embedded map script was found.
- There is no self-service account deletion flow and no declared retention schedule or DPO/operator contact in the repository.

## Legal reference points

1. RA 10173 requires transparency, legitimate purpose, proportionality, appropriate lawful processing, limited retention, and reasonable organizational, physical, and technical safeguards. The IRR describes data-subject rights, DPO/accountability expectations, processor duties, security, and breach processes.
2. NPC Circular 2023-06 is the current general security circular identified in this review; NPC states it covers DPO registration, processing-system registration, privacy impact assessment, privacy management, personnel training, storage, access controls, and business continuity. The PIC must determine the specific duties and registration applicability for its organization and data processing system.
3. RA 10173 and its IRR require notification to the NPC and affected people within 72 hours when the statutory notifiable-breach criteria are met. The incident lead must promptly assess the criteria; this is not a rule to notify every security event.
4. Executive Order 58 (2024) adopts the National Cybersecurity Plan 2023-2028. It directs national government agencies and instrumentalities, including GOCCs, and encourages LGUs to implement cybersecurity plans relevant to their mandates. The plan is a national policy reference, not by itself a claim that a private pilot has adopted the plan. EO 119 (2026) establishes a risk-based data classification and residency framework for government data. The E-Governance Act IRR covers state universities and colleges for covered government services. Whether those public-sector rules apply depends on the operator, adoption, and whether the data is government data; resolve that before treating the project as a private-sector deployment.
5. The NPC Privacy Toolkit discusses cookies and transparent privacy notices. The DPA source reviewed does not establish a universal opt-in banner for every strictly necessary authentication cookie. Reassess if nonessential tracking is added or the deployment context changes.

## Required before a public launch

- Name the PIC (legal entity and address), determine whether NVSU or another institution is involved, appoint/designate the accountable DPO or privacy contact, and publish a monitored email/contact channel. Determine the intended and likely user age range; if the service is likely to be accessed by children, complete the child-oriented privacy impact assessment and make the transparency notice understandable to that audience. Do not assume the university is the PIC without an explicit governance decision. If an SUC or government body operates or formally adopts the service, assess the E-Governance Act and EO 119 government data classification/residency rules against the data and providers before selecting deployment regions.
- Complete and approve a Privacy Impact Assessment for the pilot, including public contact/address disclosure, public review text, administrator access, Supabase, hosting, auth email, storage, logs, and cross-border processing.
- Verify Supabase project region, hosting provider/region, email provider, subprocessors, data-processing agreements, backups, vendor retention, and data-subject request assistance. Update the Privacy Notice with confirmed recipients and locations.
- Adopt a retention schedule with concrete durations or review triggers for accounts, drafts, approved listings, photos, favorites, reviews, reports, moderation events, backups, and provider logs. Document deletion/anonymization and backup expiry. Implement account closure/deletion or a tracked request workflow compatible with foreign-key restrictions.
- Confirm lawful basis by purpose and record the balancing assessment where legitimate interests are used. Confirm notice/consent presentation at registration and when owner content becomes public. Keep optional cookies disabled until an approved purpose, basis, notice, and choice mechanism exist.
- Verify production HTTPS and that the hosting platform applies the security headers configured in `next.config.ts`, Supabase RLS and storage policies, role assignment, administrator MFA, least privilege, secret handling, dependency/update process, backup restoration, and incident contacts. Do not publish a claim until the control is configured and verified.
- Adopt a security incident playbook with triage, evidence preservation, containment, recovery, vendor escalation, notification decision owner, NPC reporting steps, and user communications. Maintain a 24/7 escalation route sufficient to meet applicable deadlines.
- Train staff/admins on least-privilege handling, private reports, public content, credential safety, phishing, and breach escalation. Re-review when features, vendors, purposes, or hosting change.

## Incident response minimum

1. Report suspected events to the designated security/privacy lead immediately; preserve timestamps, affected systems, and available evidence without distributing exposed personal data.
2. Contain the issue, secure affected credentials or access paths, involve relevant processors, and establish scope and affected data subjects.
3. The PIC determines whether the event meets the DPA and NPC Circular 16-03 mandatory-notification criteria. When notification is required, notify the NPC and affected people within the applicable 72-hour window from knowledge or reasonable belief, subject only to legally permitted exceptions or delay. Provide accurate notice and supplement it as investigation findings become available.
4. Restore service safely, document decisions and remediation, and update the PIA, controls, training, and retention rules where the incident reveals a gap.

## Sources

- [RA 10173, Data Privacy Act of 2012](https://privacy.gov.ph/data-privacy-act-/)
- [Implementing Rules and Regulations of RA 10173](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-%202012/)
- [NPC Circular 2023-06 security summary and official circular link](https://privacy.gov.ph/npc-issues-circulars-to-strengthen-personal-data-protection-in-ph/)
- [NPC Circular 16-03, Personal Data Breach Management](https://privacy.gov.ph/wp-content/uploads/2022/01/sgd-npc-circular-16-03-personal-data-breach-management.pdf)
- [NPC Privacy Toolkit](https://privacy.gov.ph/wp-content/uploads/2022/01/3rdToolkit_0618.pdf)
- [NPC Circular 2023-04, Guidelines on Consent](https://privacy.gov.ph/wp-content/uploads/2024/05/2023-compendium-2.pdf)
- [NPC Circular 2023-07, Guidelines on Legitimate Interest](https://privacy.gov.ph/wp-content/uploads/2024/05/2023-compendium-2.pdf)
- [NPC Advisory No. 2024-03, Guidelines on Child-Oriented Transparency](https://privacy.gov.ph/wp-content/uploads/2024/12/Advisory-2024.12.17-Guidelines-on-Child-Oriented-Transparency-w-SGD.pdf)
- [NPC 2026 advisory on digital platforms accessible to minors](https://privacy.gov.ph/public-advisory-npc-calls-on-digital-platforms-to-ensure-compliance/)
- [Executive Order No. 58, adopting NCSP 2023-2028](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/5/97132)
- [Executive Order No. 119 (2026), government data classification and residency](https://elibrary.judiciary.gov.ph/thebookshelf/showdocs/5/101813)
- [Implementing Rules and Regulations of the E-Governance Act, RA 12254](https://elibrary.judiciary.gov.ph/thebookshelf//showdocs/2/101634)
- [DICT National Cybersecurity Plan 2023-2028](https://cms-cdn.e.gov.ph/DICT/pdf/NCSP-2023-2028-FINAL-DICT.pdf)
