# Team Leader Implementation Guide

## Your ownership, build order and integration responsibilities

**Owner:** Team Leader / Member 1\
**Primary ownership:** Database, authentication, products, plans,
subscriptions, quotations and integration.

------------------------------------------------------------------------

## 1. Your mission

You are responsible for the shared foundation and the business entities
that the other two members depend on. Your job is not to write every
line of code. Your job is to make sure the team builds against one
agreed database model and stable API contracts.

### Your owned areas

-   `prisma/`
-   `src/modules/auth/`
-   `src/modules/products/`
-   `src/modules/plans/`
-   `src/modules/subscriptions/`
-   `src/modules/quotations/`
-   `src/lib/`
-   `src/app/api/auth/`
-   `src/app/api/products/`
-   `src/app/api/plans/`
-   `src/app/api/subscriptions/`
-   `src/app/api/quotations/`
-   `src/app/api/customers/`
-   Root configuration and README

You coordinate changes to shared files such as `schema.prisma`,
`src/types/`, `package.json` and `src/app/layout.tsx`.

## 2. What you must build

### A. Foundation

-   Initialize the Next.js TypeScript application.
-   Configure environment variables.
-   Connect Prisma to PostgreSQL.
-   Set up migrations and seed data.
-   Create a shared Prisma client.
-   Establish validation and error-response conventions.

### B. Authentication and authorization

-   Registration with unique email.
-   Password policy from the problem statement.
-   Secure password hashing.
-   Login/session management.
-   Password reset flow.
-   Admin, Staff and Customer roles.
-   Server-side authorization helpers.
-   Customer ownership checks.

Do not rely only on client-side route hiding for access control.

### C. Product and variant management

-   Create, list, view, update and archive products.
-   Store product type, sales price, cost price and notes.
-   Manage variants and their additional price.
-   Validate prices and variant ownership.

### D. Plans

-   Create, list, view, update and deactivate plans.
-   Store billing interval and interval count.
-   Store minimum quantity and availability dates.
-   Store allowed actions: pause, early close, renewal and auto-close.
-   Validate that a plan is available before a new subscription is
    created.

### E. Subscriptions

-   Create a subscription from a confirmed quotation or an authorized
    workflow.
-   Generate a unique subscription number.
-   Store customer, plan, dates, payment terms and lines.
-   Implement allowed state transitions.
-   Support pause, resume, renewal and closure when permitted.
-   Calculate next billing date reliably.
-   Expose the subscription information needed by the billing member.

### F. Quotations

-   Create and manage quotation templates.
-   Create quotations for customers.
-   Store validity dates and quotation lines.
-   Confirm/accept quotations.
-   Convert an accepted quotation into a subscription without losing
    line pricing/tax information.

## 3. Suggested module file pattern

Use a consistent pattern when a module becomes more than a few lines:

``` text
src/modules/products/
├── product.service.ts
├── product.repository.ts
├── product.validation.ts
└── product.types.ts
```

-   `service`: business rules and orchestration.
-   `repository`: database queries, if using a repository layer.
-   `validation`: Zod schemas for inputs.
-   `types`: module-specific types where shared types are not
    appropriate.

Keep route handlers thin: validate request, check permission, call
service, return response.

## 4. Your first implementation sequence

1.  Confirm stack and create the Next.js app.
2.  Add `.env.example` and local `.env` (never commit `.env`).
3.  Configure PostgreSQL and Prisma.
4.  Agree on the complete initial database schema with Member 3.
5.  Run the first migration and seed demo data.
6.  Implement authentication and role checks.
7.  Implement products and variants.
8.  Implement plans.
9.  Implement customers.
10. Implement quotations.
11. Implement subscription lifecycle.
12. Publish API contracts for Member 2.
13. Integrate billing services from Member 3.
14. Test the end-to-end workflow with the team.

## 5. Database ownership and collaboration

You own the schema file and migration workflow, but you must collect
requirements from Member 2 and Member 3 before finalizing models.

At minimum, discuss these entities:

-   User
-   Customer
-   Product
-   ProductVariant
-   Plan
-   Tax
-   QuotationTemplate
-   Quotation
-   QuotationLine
-   Subscription
-   SubscriptionLine
-   Invoice
-   InvoiceLine
-   Discount
-   DiscountUsage
-   Payment

Member 3 should specify billing-period uniqueness, invoice/payment
relationships, discount usage tracking and tax snapshots. A confirmed
invoice should preserve the prices and tax values used when it was
issued; later product/plan edits should not silently rewrite historical
invoices.

Use database transactions for multi-record operations such as
quotation-to-subscription conversion and payment recording.

## 6. Integration contract with the frontend

Before Member 2 connects screens, provide: - Endpoint and HTTP method. -
Authentication requirement. - Required role. - Request body. - Success
response. - Error response. - Pagination/filter parameters.

Example product endpoint contract:

``` http
GET /api/products?page=1&pageSize=20
POST /api/products
GET /api/products/:id
PATCH /api/products/:id
```

Example create request:

``` json
{
  "name": "Business Suite",
  "type": "SOFTWARE",
  "salesPrice": 999,
  "costPrice": 300,
  "notes": "Monthly business software"
}
```

Example response:

``` json
{
  "data": {
    "id": "product_id",
    "name": "Business Suite",
    "type": "SOFTWARE",
    "salesPrice": 999,
    "costPrice": 300
  }
}
```

Use one agreed response envelope across the application. The examples
are proposed contracts, not requirements stated by the hackathon brief.

## 7. How to connect frontend and backend

1.  Agree on API contracts with Member 2.
2.  Implement route handlers under `src/app/api/`.
3.  Put business logic in `src/modules/`.
4.  Member 2 calls those endpoints from frontend components/hooks.
5.  Use loading, empty, success and error states in the UI.
6.  Enforce permissions and ownership in the server.
7.  Test each endpoint with realistic data before connecting the page.

Suggested frontend data flow:

`Page / Component → fetch or API client → Route Handler → Validation → Service → Prisma → PostgreSQL`

Do not import Prisma directly into client components.

## 8. Single-branch Git collaboration

The event participant guide instructs the team to keep code in one
repository branch. Use `main` as the shared branch if that is the branch
submitted.

To reduce conflicts: - Assign separate files/folders to each
developer. - Coordinate before changing shared files. - Pull the latest
`main` before starting a task. - Commit small, focused changes. -
Coordinate pushes; do not push simultaneously. - Resolve conflicts
before continuing. - Never commit `.env` or credentials.

Example:

``` bash
git pull --rebase origin main
git add src/modules/products
git commit -m "feat(products): add product management service"
git pull --rebase origin main
git push origin main
```

## 9. Definition of done for your work

A feature is not done merely because its page or endpoint exists. It is
done when: - Input is validated. - Correct role is enforced. - Customer
data ownership is enforced where relevant. - Database writes are
correct. - Errors are handled. - The frontend can consume the API. - A
test or reproducible manual test exists. - The change is committed to
the shared branch.
