# MNQ Tradebook — independent deployment

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

GitHub stores code only. Supabase Postgres stores journal snapshots with atomic revision checks; its private Storage bucket holds screenshots. IndexedDB holds device-local recovery copies. Full JSON and CSV exports remain available. Hosting and storage depend on your Vercel/Supabase accounts, not ChatGPT Plus.
