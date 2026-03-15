# Romanian Accountant Multi-Tenant Portal

A Next.js + TypeScript + Prisma + Postgres workspace for accounting firms managing multiple client companies.

## Production-readiness status

### Implemented

- Tenant isolation at API and DB levels:
  - API writes derive tenant from authenticated `x-user-id` instead of trusting payload.
  - Prisma schema enforces same-tenant links for notes, assignments, and reminders using composite relations (`[entityId, firmId]`).
- Role-based access checks for mutation routes.
- Background reminder queue with a worker that processes unsent reminders and marks them delivered.
- Initial migration checked into `prisma/migrations`.
- Seed data for **two firms** to validate multi-tenant behavior and demo dashboards.

### Mocked (intentional placeholders)

- Reminder delivery channels (`EMAIL`, `WHATSAPP`) currently log `[MOCK DELIVERY]` in `dispatchReminder`.
- Authentication is header-based (`x-user-id`) for local/demo usage; no real auth provider is wired yet.

### Still needed for full production hardening

- Replace mock notification delivery with real provider adapters (SES/Mailgun/Twilio/WhatsApp API).
- Integrate real authentication (JWT/session provider) and remove direct header trust.
- Add rate limiting and request audit logs for API endpoints.
- Add automated test suite (unit/integration/e2e) and CI checks.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Background jobs with pg-boss

## Environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required values:

- `DATABASE_URL`: Postgres connection string used by Prisma + pg-boss.
- `DEFAULT_FIRM_ID`: optional tenant used by server-rendered pages when no `x-firm-id` header exists.
- `PG_BOSS_SCHEMA`: optional pg-boss schema, defaults to `public`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Run migrations:

```bash
npm run prisma:migrate
```

4. Seed demo data:

```bash
npm run prisma:seed
```

Seed output prints values to copy into `.env`/API calls:

- `DEFAULT_FIRM_ID`
- `DEMO_MANAGER_USER_ID`

5. Start app + worker in separate terminals:

```bash
npm run dev
npm run worker
```

## API endpoints

All write endpoints require header `x-user-id` for the acting user.

- `POST /api/companies` (roles: `MANAGER` and above)
- `POST /api/notes` (roles: `ACCOUNTANT` and above)
- `POST /api/reminders` (roles: `ACCOUNTANT` and above; enqueues `send-reminder` background job)

Example headers for local testing:

```text
x-user-id: <DEMO_MANAGER_USER_ID>
x-firm-id: <DEFAULT_FIRM_ID>  # optional for pages, not required for writes
```
