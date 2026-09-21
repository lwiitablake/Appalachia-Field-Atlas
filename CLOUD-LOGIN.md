# What real email login and cross-device data would take

The current release keeps encrypted journals local. No email authentication or cloud synchronization is enabled by this archive. GitHub moderation uses GitHub identity, independently of local profiles.

## Practical architecture

Keep the static interface on GitHub Pages. Add a hosted authentication service and database, such as Supabase Auth + Postgres, plus production SMTP from an email-delivery provider. Users request a magic link or email code; the provider validates it and issues an authenticated session. Set the permitted callback URLs to the exact Pages/custom-domain addresses. A user sees the same journal from any device after sign-in because records are stored in the database under their authenticated user ID.

Use row-level security so each user can read/write only their own journal. Store roles in an administrator-managed table or protected claims; clients must not be able to promote themselves. Protect moderator operations and pending-media access on the server. Object storage holds private pending uploads; approved public media can be exported into GitHub by a server-side GitHub App with narrowly scoped repository permissions. An Edge Function/server verifies the session and role, validates uploads, rate-limits abuse and writes the publication. Secrets and service-role keys must stay off GitHub Pages and out of the public repository.

Minimum data entities: authenticated users; private journals keyed by user ID; submissions with pending/approved/rejected state and author; ordered photo metadata and storage keys; moderator roles; immutable review/audit records. Add conflict handling for multi-device edits, quotas, deletion/export, backups, abuse reporting, recovery, session expiry and email deliverability monitoring. Migrate local journals only after explicit user consent, by decrypting locally and uploading to the authenticated account; retain an export/rollback path.

## Privacy tradeoff

This changes the original no-server-data design. The auth/email providers process addresses and delivery metadata; database/storage providers hold account content. With ordinary server-side storage, the project administrator can technically access the data even when normal user policies prevent cross-user access. If the requirement remains that the owner must not be able to read private journals, encrypt journal payloads on the client with a separate user-controlled secret and design device transfer/recovery accordingly. Email login alone is not end-to-end encryption. Moderated public submissions necessarily remain readable to moderators.

## Setup needed from the owner

Create the auth/database and mail-provider accounts, choose a plan, configure a verified sending domain (DNS records), configure callback URLs, authorize the GitHub App/repository, and identify the initial administrator account by authenticated user ID. Deploy and test database/storage policies with two separate users and an unauthorized account, magic-link expiry/replay, moderator revocation and cross-device conflicts. Provide privacy/retention notices and a deletion process. There may be recurring email, storage, database and bandwidth charges; exact cost depends on usage and the chosen plans. No paid plan or account has been created here.

GitHub Pages alone cannot send secure login emails, privately store synced accounts or enforce custom server-side moderator roles. Supabase's built-in test mail service is not appropriate for general production signups; configure production SMTP.

Sources: [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [production checklist](https://supabase.com/docs/guides/deployment/going-into-prod), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [storage access control](https://supabase.com/docs/guides/storage/security/access-control).
