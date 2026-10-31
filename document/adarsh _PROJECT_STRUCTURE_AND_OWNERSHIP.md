# Project Structure and Ownership

## Subscription Management System

This document explains what each directory is for and who owns it.

## 1. Repository tree with owners

``` text
subscription-management-system/
├── prisma/                              [MEMBER 1 - TEAM LEADER]
│   ├── schema.prisma                    [MEMBER 1; consult Member 3]
│   ├── seed.ts                          [MEMBER 1]
│   └── migrations/                      [MEMBER 1]
│
├── public/                              [MEMBER 2]
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── (auth)/                      [MEMBER 2 UI; Member 1 auth logic]
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/                 [MEMBER 2]
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── plans/
│   │   │   ├── subscriptions/
│   │   │   ├── quotations/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   ├── discounts/
│   │   │   ├── customers/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── portal/                      [MEMBER 2 UI; Member 1 permissions]
│   │   │   ├── layout.tsx
│   │   │   ├── subscriptions/
│   │   │   ├── invoices/
│   │   │   └── payments/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/                    [MEMBER 1]
│   │   │   ├── products/                [MEMBER 1]
│   │   │   ├── plans/                   [MEMBER 1]
│   │   │   ├── subscriptions/           [MEMBER 1]
│   │   │   ├── quotations/              [MEMBER 1]
│   │   │   ├── customers/               [MEMBER 1]
│   │   │   ├── invoices/                [MEMBER 3]
│   │   │   ├── payments/                [MEMBER 3]
│   │   │   ├── discounts/               [MEMBER 3]
│   │   │   ├── billing/                 [MEMBER 3]
│   │   │   ├── webhooks/                [MEMBER 3]
│   │   │   └── cron/                    [MEMBER 3]
│   │   │
│   │   ├── layout.tsx                   [MEMBER 1 + 2; coordinate]
│   │   └── page.tsx                     [MEMBER 2]
│   │
│   ├── components/                      [MEMBER 2]
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── subscriptions/
│   │   ├── invoices/
│   │   └── shared/
│   │
│   ├── modules/
│   │   ├── auth/                        [MEMBER 1]
│   │   ├── products/                    [MEMBER 1]
│   │   ├── plans/                       [MEMBER 1]
│   │   ├── subscriptions/               [MEMBER 1]
│   │   ├── quotations/                  [MEMBER 1]
│   │   ├── billing/                     [MEMBER 3]
│   │   │   ├── billing.service.ts
│   │   │   ├── invoice-generator.ts
│   │   │   ├── renewal.service.ts
│   │   │   └── jobs/
│   │   ├── invoices/                    [MEMBER 3]
│   │   ├── payments/                    [MEMBER 3]
│   │   ├── discounts/                   [MEMBER 3]
│   │   └── analytics/                   [MEMBER 3]
│   │
│   ├── lib/                             [MEMBER 1; shared utilities]
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── validations/
│   │   ├── permissions.ts
│   │   └── utils.ts
│   │
│   └── types/                           [SHARED; coordinate changes]
│
├── tests/
│   ├── unit/                            [ALL]
│   ├── integration/                     [ALL]
│   └── e2e/                              [ALL]
│
├── .env.example                         [MEMBER 1]
├── .gitignore                           [MEMBER 1]
├── README.md                            [MEMBER 1; team contributions]
├── package.json                         [MEMBER 1; coordinate dependencies]
└── tsconfig.json                        [MEMBER 1]
```

## 2. Ownership summary

### Member 1 --- Team Leader / Backend foundation

Owns database, authentication, authorization, products, plans,
customers, quotations, subscriptions and shared backend conventions.

### Member 2 --- Frontend

Owns dashboard and customer portal pages, reusable components, UI
states, styling and frontend API integration.

### Member 3 --- Billing and finance

Owns billing services, invoice generation, renewals, taxes, discounts,
payments, webhooks, scheduled jobs and financial analytics.

### Shared work

All members contribute tests and integration fixes. The team leader
coordinates shared schema and configuration changes.

## 3. Folder responsibilities

-   `prisma/`: database schema, migrations and seed data.
-   `src/app/`: Next.js routes, layouts, pages and API route handlers.
-   `src/components/`: reusable visual components.
-   `src/modules/`: business logic organized by domain.
-   `src/lib/`: shared infrastructure helpers, Prisma client,
    permissions and validation.
-   `src/types/`: shared TypeScript contracts.
-   `tests/`: unit, integration and end-to-end tests.
-   `public/`: static images and icons.

## 4. Important architecture boundary

A frontend page should not contain database queries. The expected flow
is:

`Page / Component → API Route Handler → Validation + Authorization → Domain Service → Prisma → PostgreSQL`

Route handlers should stay thin. Business rules belong in
`src/modules/`.

## 5. Suggested additions to the supplied structure

Add these files/folders when implementing the corresponding features:

``` text
src/
├── app/
│   └── api/
│       ├── products/[id]/route.ts
│       ├── plans/[id]/route.ts
│       ├── subscriptions/[id]/route.ts
│       ├── quotations/[id]/route.ts
│       ├── invoices/[id]/route.ts
│       ├── payments/[id]/route.ts
│       └── customers/[id]/route.ts
├── modules/
│   ├── products/product.validation.ts
│   ├── plans/plan.validation.ts
│   ├── subscriptions/subscription.validation.ts
│   └── billing/billing.types.ts
└── lib/
    ├── api-response.ts
    └── errors.ts
```

Dynamic `[id]` routes are needed for individual record operations. Add
more endpoints only as the API contract requires them.
