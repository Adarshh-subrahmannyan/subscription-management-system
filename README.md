# Subscription Management System

Initial Next.js App Router scaffold for managing products, plans, subscriptions,
customers, billing, invoices, payments, and the customer portal. Billing
services are grouped under `src/modules/billing`, API domains under
`src/app/api`, and tests under `tests`.

## Getting started

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

The application routes are organized under `src/app`, reusable UI lives under
`src/components`, and domain logic is grouped under `src/modules`.

### Password reset demo

`POST /api/auth/forgot-password` always returns the same generic message so
account existence cannot be discovered. When running outside production, the
response also includes `demoResetToken` and `expiresAt`; use that token with
`POST /api/auth/reset-password` and a new password. Production responses never
return reset tokens. Configure `AUTH_RESET_TOKEN_TTL_MINUTES` to change the
default 60-minute expiry.

## Database migrations

Create and apply a local migration after updating the Prisma schema:

```bash
npx prisma migrate dev --name init
```
