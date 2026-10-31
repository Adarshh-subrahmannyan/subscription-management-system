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

## Database migrations

Create and apply a local migration after updating the Prisma schema:

```bash
npx prisma migrate dev --name init
```
