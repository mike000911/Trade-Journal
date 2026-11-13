# Futures Tradebook — independent deployment

This folder ports the private ChatGPT Sites journal at source commit `3cf2a51d2a008e0f061a44403f4a94e4a9459993` to Vercel + Supabase. The existing Next.js application in the repository root is preserved.

## Deployment

Import `mike000911/Trade-Journal` into Vercel as a separate project. Choose root directory **tradebook**, framework **Other**, install command **npm ci**, no build command, output directory **public**, Node **22.x**. Deploy branch `tradebook-sites-migration`.

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` as Vercel environment variables using `.env.example`. No service-role key is used. The API runs with the signed-in user's token and row-level security.

`db/schema.sql` was applied as remote migration `tradebook_private_journal` to project `bzvyzarivuyjrytkjqtw`. Do not rerun it against that project. It creates isolated journal/owner tables and a private screenshot bucket, preserving the existing Prisma tables.

## Owner setup (required before the journal is usable)

1. In Supabase Authentication → Users, create your email/password account using a password you choose privately. Do not share the password in chat or commit it.
2. Register its UUID in SQL Editor:

```sql
insert into public.tradebook_owner (user_id) values ('YOUR_AUTH_USER_UUID');
```

Only one owner can be registered. The frontend has no public signup. Until an owner exists, access is denied to every account. Server requests validate the token with Supabase Auth and check the owner row; both database and screenshot policies also enforce ownership.

Sign in at the deployed URL. Sessions use Secure, HttpOnly, SameSite=Strict cookies and expire after at most one hour; sign in again to resume cloud synchronization. Local edits are preserved on session expiry.

## Move existing journal data

On the current Sites journal, download **Full backup** while signed in. It includes screenshots. On this deployment, sign in and **Restore backup**, then wait for “synced across devices.” Verify trade count, totals and screenshots on a second device before retiring the old site. CSV is for analysis, not full restoration. The old site has not been changed or deleted. Browser-local data does not move automatically between domains.

Screenshot uploads are limited to 4 MB each (four per trade) to fit the Vercel request limit. Existing backups containing larger screenshots need those images resized before cloud sync.

## Verify

```
npm ci
npm test
```

Tests cover MNQ P&L, fees, risk multiples, drawdown, duration boundaries, draft exclusions, snapshot validation, screenshot signatures, and cross-origin rejection. Production sign-in, persistence, conflict handling and screenshots must also be checked after owner configuration.

## Data ownership

GitHub stores code only. Vercel private Blob storage holds journal snapshots and new screenshots. Journal updates use revision checks and conditional ETag writes to prevent lost updates across devices. Supabase still handles sign-in and the owner allowlist. Existing Supabase journals are read until the first successful Vercel save; existing screenshots remain readable from Supabase when not present in Vercel. No legacy records are deleted. IndexedDB holds device-local recovery copies. Full JSON and CSV exports remain available. Hosting and storage depend on your Vercel/Supabase accounts, not ChatGPT Plus.

## Multi-instrument and quicker entry

Supports MNQ, NQ, MES, ES, YM, GC, MGC, CL and MCL. Missing symbols on legacy records mean MNQ; unsupported symbols are rejected. Calculations use outright futures tick sizes, not spread or options specifications. Contract values were checked against CME Group equity-index, micro equity, gold/micro gold and WTI/micro WTI documentation on 2026-10-28. Each instrument displays its contract-specification link in the app.

Quick entry keeps price, risk, timing and short reflection visible. Detailed entry exposes analysis and checklist; hidden values are preserved and checkboxes are never auto-confirmed. Favourite instruments, last selection and entry mode sync in journal settings.

Daily plans are keyed by device-local trade date and instrument, autosaved inside `settings.dailyPlans`, and included in full JSON backups. Attaching a plan explicitly copies its notes and stores an immutable JSON snapshot on the trade. Trade CSV includes the attachment, and plans have their own CSV export. Updating the daily plan does not rewrite saved trade snapshots.

Dashboard and calendar share an instrument filter. History has a separate filter. The collapsed instrument comparison reports P&L and expectancy in R. Browser-local drafts remain supported. New test coverage includes every instrument's long/short P&L, valid tick increments, legacy records, plan attachment and independent snapshots, backup settings, filters and CSV.



## Public accounts and seven-day trial

`/signup` creates an email/password account using Supabase Auth. Email confirmation is required by the current project settings; configure production SMTP and allow `https://mnq-tradebook.vercel.app/login` in Auth redirect URLs for reliable confirmation delivery. The app handles confirmation-required and immediate-session responses. No authentication secret is sent to the browser.

Trials run for exactly 168 hours from the immutable Auth `created_at` timestamp. Every journal/image mutation checks live identity and server-side trial access. Editable profile metadata is never used for entitlement. The existing `tradebook_owner` account remains unlimited. After expiry, `/account` and `/api/export` remain accessible, while new saves/uploads return 402. `/plans` honestly marks paid membership coming soon: no payment collection, payment provider, subscription price or recurring charge is configured.

Vercel Blob namespaces use the verified user ID. Browser IndexedDB names are per-account; only the verified owner retains the original device database for continuity. Cloud calls carry the page's user ID so stale tabs cannot read or write the account of a later sign-in. Existing Supabase journal and image RLS policies stay owner-only for legacy fallback; new users store data in private Vercel Blob.

Validation: `npm test` covers trial boundary, owner exemption, confirmation flow, anonymous/CSRF rejection, account isolation and expiry. Email delivery requires a real inbox check; no customer account is created by automated tests.
