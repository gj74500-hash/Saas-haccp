# HACCP Pro

Multi-tenant food safety compliance SaaS for restaurants, hotels, cafés,
bakeries, food production facilities and caterers. Digital HACCP: temperature
monitoring, cleaning management, records, alerts, reports and audit trails.

## Stack

- **Next.js 15** (App Router, React Server Components, Server Actions)
- **TypeScript** (strict)
- **Tailwind CSS v4** with an owned component library (`src/components/ui`)
- **PostgreSQL 16** + **Prisma**
- **Auth.js (NextAuth v5)** — credentials auth, JWT sessions, role claims
- **next-intl** — English first; French and Thai are added by dropping in
  `messages/fr.json` / `messages/th.json`
- **Dark mode** — class-based, follows system preference, user toggle in the
  topbar persisted to `localStorage`, no flash on load
- **PWA** — installable, offline static shell, push-ready service worker
- **Docker** — multi-stage image + compose stack

## Getting started

### Local development

```bash
cp .env.example .env            # then set AUTH_SECRET (openssl rand -base64 32)
docker compose up -d db         # start PostgreSQL
npm install
npx prisma migrate dev          # create schema
npm run db:seed                 # demo tenant + data
npm run dev
```

Demo logins (password `Demo1234!`):

| Role | Email |
|---|---|
| Owner | `owner@demo.haccppro.app` |
| Manager | `manager@demo.haccppro.app` |
| Employee | `employee@demo.haccppro.app` |

### Full Docker stack

```bash
docker compose up --build
```

The app container applies pending migrations on boot and serves on
`http://localhost:3000`.

## Architecture

- **Tenancy** — single database, shared schema. Every tenant table carries a
  `companyId`. All data access goes through `src/lib/services/*`, which is the
  only layer allowed to query tenant data and always scopes by the
  authenticated user's company (`requireUser()` in `src/lib/auth/guards.ts`).
- **Roles** — `OWNER > MANAGER > EMPLOYEE`, expressed as capabilities in
  `src/lib/auth/permissions.ts` so UI and server share one source of truth.
- **Audit trail** — append-only `AuditLog` written via `src/lib/audit.ts`.
- **Compliance score** — computed on demand from primary records
  (`src/lib/compliance-score.ts`), never stored.
- **Billing-ready** — `Subscription` is modeled now (companies start on a
  14-day trial); Stripe webhooks slot in later without schema changes.

```
src/
├── app/
│   ├── (auth)/          login, register, forgot/reset password
│   ├── (dashboard)/     dashboard + feature modules
│   └── api/             NextAuth handlers, health check
├── actions/             server actions (auth, login)
├── components/
│   ├── ui/              owned design system primitives
│   ├── layout/          sidebar, topbar, mobile tab bar
│   └── features/        per-module components
├── lib/
│   ├── auth/            NextAuth config, guards, permissions
│   ├── services/        tenant-scoped data access
│   ├── validations/     zod schemas (shared client/server)
│   └── mail/            mail provider abstraction
├── i18n/                next-intl request config
└── middleware.ts        edge route protection
```

## Troubleshooting

**`{"message":"There was a problem with the server configuration."}` on sign-in**

This is Auth.js's generic configuration error. Open `/api/health` — it
reports exactly which precondition is failing and how to fix it. The causes,
in order of likelihood:

1. **PostgreSQL isn't running or `DATABASE_URL` is wrong.** Start it with
   `docker compose up -d db` and make sure `.env` exists
   (`cp .env.example .env`).
2. **Schema not migrated.** Run `npx prisma migrate deploy` (and
   `npm run db:seed` for demo data).
3. **`AUTH_SECRET` not set** (common on fresh deployments to Vercel/Railway/
   Render). Generate one with `openssl rand -base64 32` and set it in the
   host's environment variables.

Untrusted-host errors are already ruled out: the app sets `trustHost: true`,
so no `AUTH_TRUST_HOST` variable is required.

## Roadmap

1. ✅ Foundation — scaffold, schema, Docker, i18n, design system
2. ✅ Auth & tenancy — register/login/reset, roles, audit log
3. ✅ Dashboard — KPIs, compliance score, alerts, activity
4. Temperature module — equipment, logs, corrective actions, PDF export
5. Cleaning module — schedules, checklists, assignment
6. HACCP records — form builder, submissions, signatures
7. Alerts & push notifications
8. Reports (daily/weekly/monthly, PDF)
9. Company management — locations, team, permissions
10. Stripe billing · French & Thai locales
