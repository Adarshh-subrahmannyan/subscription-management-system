# Subscription Management System

Initial Next.js App Router scaffold for managing products, plans, subscriptions,
customers, billing, invoices, payments, and the customer portal.

## Getting started

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

The application routes are organized under `src/app`, reusable UI lives under
`src/components`, and domain logic is grouped under `src/modules`.
