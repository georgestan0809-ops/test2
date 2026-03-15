# Romanian Accountant Multi-Tenant Portal

A Next.js + TypeScript + Prisma + Postgres starter for Romanian accounting firms managing multiple client companies.

## Core features

- Firm workspace that isolates tenant data by `firmId`.
- Multiple client companies per accounting firm.
- Client status dashboard: invoices, collections, e-Factura checks, SAF-T prep, and tax deadlines.
- Internal notes and assignment tracking.
- Reminder scheduler backed by Postgres jobs (`pg-boss`).
- Role-based permissions for API writes.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Background jobs with pg-boss

## Quick start

1. Copy environment file:

```bash
cp .env.example .env
```

2. Install deps and generate Prisma client:

```bash
npm install
npm run prisma:generate
```

3. Apply migrations (or use `prisma db push`) and seed:

```bash
npx prisma db push
npm run prisma:seed
```

4. Put seeded `firmId` in `.env` as `NEXT_PUBLIC_FIRM_ID`.

5. Run app + worker:

```bash
npm run dev
npm run worker
```

## API endpoints

- `POST /api/companies` (roles: MANAGER+)
- `POST /api/notes` (roles: ACCOUNTANT+)
- `POST /api/reminders` (roles: ACCOUNTANT+, also enqueues job)

Pass caller role in header `x-role` for now.
