# Tradebook — private MNQ journal

Responsive dashboard, journal entry, and history views. Owner-only access is enforced by the Sites policy, with ChatGPT sign-in on each device. Never change the audience to public merely to simplify access.

## Data

D1 stores each authenticated user's journal, settings, and working draft. R2 holds screenshots under that user's namespace. API routes reject missing identity; records are scoped to the injected Sites user ID. Browser IndexedDB retains a recovery copy when offline. Revisions prevent silent cross-device overwrites; the app asks which copy to retain on a conflict. Cloud refresh runs on focus and every 30 seconds while visible. Wait for “synced across devices” before switching devices. Cloud sync requires connectivity and authenticated access.

The app supports four screenshots per trade, 5 MB each. The journal metadata limit is 1.5 MB per save; screenshots are stored separately. CSV includes records, reasoning, checklists, reflections and screenshot names. Full JSON backup downloads the image data too and can be restored. Removed images remain private in storage; there is no automatic destructive image purge.

## Calculations

MNQ tick size 0.25 points, $0.50 per tick per contract ($2 per point). Realized P&L respects direction, size and fees. R uses original planned stop risk. KPI definitions and editable review targets are available in Dashboard settings.

## Development

Use the Sites starter helpers for dependency setup, builds, source synchronization and deployment. `.openai/hosting.json` declares DB and BUCKET. Drizzle migrations are committed under `drizzle/`; never edit already applied migrations. The shell HTML is `journal/index.html`, browser assets are in `public/`, and API implementation is `worker/journal-api.ts`.

Checks:
- `node tests/analytics.cjs`
- `node --experimental-strip-types tests/cloud.mjs`
- Sites `build-site.mjs`

Managed preview does not impersonate a signed-in user. A 401 from cloud sync in preview is expected; local recovery saving remains usable. Cloud API tests exercise identity isolation, revision conflicts and upload validation with in-memory storage adapters. Live authenticated cross-device verification requires the owner's browser session.

## Calendar and duration

The dashboard calendar uses the device timezone (shown above it), independently of the analytics reporting timezone. Selecting a day and choosing Add journal entry prefills the date. Entry and exit use time-only controls; choose Next day for overnight trades or Another date for longer holds. Original ISO timestamps continue to work for existing trades. A selected date is retained even in a draft without an entry time.

Duration is elapsed minutes between valid entry/exit timestamps for closed trades. Dashboard metrics include overall, winning and losing average duration, and closed trade count, net win rate, net P&L and expectancy for five duration bands. Open trades and drafts are excluded. Trade CSV adds durationMinutes; KPI CSV includes duration averages and band performance. Existing cloud storage and owner-only access are unchanged.
