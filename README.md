# Nasdaq Trade Journal

Premium dark-mode trade journal for Nasdaq traders using manual entries only.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Prisma + Postgres
- Cookie-based email/password auth

## Getting Started

1. Copy `.env.example` to `.env` and add your database connection.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```

5. Create or apply your Prisma migration for the updated schema before using the app with a real database:
   ```bash
   npm run prisma:migrate
   ```

## Deployment Notes

- Vercel must have both `DATABASE_URL` and `DIRECT_URL` configured before install/build so Prisma can generate the client and connect correctly.
- Prisma Client is generated automatically during `npm install` and again before `npm run build`.

## Current scaffold

- Premium landing page (`/`)
- Database-backed account creation and sign-in (`/login`)
- Dashboard (`/dashboard`) with user metrics, equity curve, and clickable calendar
- Calendar journal (`/calendar`) for daily plans, emotions, and manual trade logging
