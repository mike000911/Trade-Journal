# Nasdaq Trade Journal

Premium dark-mode trade journal for Nasdaq traders using manual entries only.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Prisma + Postgres (Supabase)
- Supabase Auth

## Getting Started

1. Copy `.env.example` to `.env` and add your keys.
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

## Current scaffold

- Premium landing page (`/`)
- Dashboard shell (`/dashboard`) with metrics cards + equity curve
- Initial Prisma schema for users, manual trades, screenshots, and weekly AI reviews
