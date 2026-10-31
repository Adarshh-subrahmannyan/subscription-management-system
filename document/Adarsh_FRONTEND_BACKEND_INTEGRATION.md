# Frontend--Backend Integration Guide

## Shared API contracts for the three-person team

This guide is the agreement between Member 1 (backend), Member 2
(frontend) and Member 3 (billing).

## 1. Architecture

``` text
Browser
  |
  v
Next.js page / React component
  |
  v
Frontend API helper (fetch)
  |
  v
Next.js Route Handler: src/app/api/**/route.ts
  |
  v
Authentication + role/ownership checks
  |
  v
Zod input validation
  |
  v
Domain service: src/modules/**
  |
  v
Prisma
  |
  v
PostgreSQL
```

Client components must not import Prisma or access database credentials.
Database access happens only on the server.

## 2. Ownership boundary

-   Member 1: auth, products, plans, customers, quotations,
    subscriptions and shared API conventions.
-   Member 2: pages, components, forms, tables, filters,
    loading/error/empty states and API consumption.
-   Member 3: billing, invoices, payments, discounts, renewals,
    scheduled jobs, webhooks and analytics.

Member 1 owns the shared database schema/migrations, but Member 3 must
define billing data requirements with Member 1 before schema changes.

## 3. API conventions

Proposed conventions: - Use JSON for request and response bodies. - Use
plural resource paths. - Use `GET` to read, `POST` to create, `PATCH` to
update/state-transition where suitable, and `DELETE` only where deletion
is safe. - Use pagination for collection endpoints. - Return consistent
errors. - Validate all input on the server. - Authenticate and authorize
every protected operation.

### Proposed success envelope

``` json
{
  "data": {},
  "meta": {}
}
```

### Proposed error envelope

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields",
    "details": {}
  }
}
```

These are team conventions, not requirements explicitly mandated by the
problem statement.

## 4. Initial endpoint map

  Area                          Endpoint                           Owner
  ----------------------------- ---------------------------------- ----------
  Authentication                `/api/auth/*`                      Member 1
  Products                      `/api/products`                    Member 1
  Product detail                `/api/products/:id`                Member 1
  Plans                         `/api/plans`                       Member 1
  Plan detail                   `/api/plans/:id`                   Member 1
  Customers                     `/api/customers`                   Member 1
  Quotations                    `/api/quotations`                  Member 1
  Subscriptions                 `/api/subscriptions`               Member 1
  Subscription detail/actions   `/api/subscriptions/:id`           Member 1
  Invoices                      `/api/invoices`                    Member 3
  Payments                      `/api/payments`                    Member 3
  Discounts                     `/api/discounts`                   Member 3
  Billing run                   `/api/billing/*`                   Member 3
  Payment provider webhooks     `/api/webhooks/*`                  Member 3
  Scheduled jobs                `/api/cron/*`                      Member 3
  Reports                       `/api/reports/*` (add if needed)   Member 3

The exact subpaths and methods must be agreed before implementation.

## 5. Example product contract

### List products

``` http
GET /api/products?page=1&pageSize=20&search=business
```

Response:

``` json
{
  "data": [
    {
      "id": "prod_123",
      "name": "Business Suite",
      "type": "SOFTWARE",
      "salesPrice": 999,
      "costPrice": 300
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 1
  }
}
```

### Create product

``` http
POST /api/products
Content-Type: application/json
```

Request:

``` json
{
  "name": "Business Suite",
  "type": "SOFTWARE",
  "salesPrice": 999,
  "costPrice": 300,
  "notes": "Business management software"
}
```

Member 2 builds the form to match this request. Member 1 validates and
persists it.

## 6. Example subscription contract

### Create subscription

``` http
POST /api/subscriptions
Content-Type: application/json
```

Proposed request:

``` json
{
  "customerId": "cust_123",
  "planId": "plan_123",
  "startDate": "2026-11-01",
  "paymentTerms": "NET_15",
  "lines": [
    {
      "productId": "prod_123",
      "quantity": 5,
      "variantId": "variant_1"
    }
  ]
}
```

Response should return the new subscription ID, unique subscription
number, status and next billing date if known.

The backend must calculate trusted prices from database records. Do not
trust a price sent by the browser.

## 7. Example invoice and payment integration

Member 3 should provide a stable invoice response to Member 2.

Example invoice summary:

``` json
{
  "id": "inv_123",
  "invoiceNumber": "INV-2026-001",
  "customerName": "Example Customer",
  "status": "CONFIRMED",
  "total": 4995,
  "amountPaid": 1000,
  "balanceDue": 3995,
  "dueDate": "2026-11-15"
}
```

Payment creation example:

``` http
POST /api/payments
```

``` json
{
  "invoiceId": "inv_123",
  "amount": 1000,
  "method": "BANK_TRANSFER",
  "paidAt": "2026-11-05",
  "note": "Initial payment"
}
```

Member 3 must calculate the remaining balance and update invoice/payment
status transactionally. The UI must display the server's resulting
status, not calculate authoritative financial status independently.

## 8. Frontend fetch example

A simple client-side request:

``` ts
async function getProducts() {
  const response = await fetch("/api/products", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message ?? "Unable to load products");
  }

  return result.data;
}
```

For larger applications, centralize this logic in an API client/helper
instead of duplicating it in every page.

## 9. Frontend states required

Every data-driven page should handle: - Loading state. - Empty state. -
Success state. - Validation errors. - Unauthorized/forbidden state. -
Server/network error. - Pagination and filters where the list can grow.

## 10. Security and correctness rules

-   Enforce roles and customer ownership in route handlers/services.
-   Never expose secrets or database URLs to browser code.
-   Do not accept final prices/tax totals from the browser as
    authoritative.
-   Recalculate invoice totals on the server.
-   Use database transactions for payment recording and invoice updates.
-   Protect billing endpoints against duplicate execution.
-   Verify webhook signatures if a payment provider is integrated.
-   Protect cron endpoints with a secret.
-   Do not let a customer request another customer's invoice by changing
    an ID.

## 11. Integration checklist

-   [ ] Backend publishes endpoint contracts.
-   [ ] Frontend uses agreed request/response types.
-   [ ] Auth session is available to protected requests.
-   [ ] Role checks work for Admin, Staff and Customer.
-   [ ] Customer can access only their own records.
-   [ ] Product and plan forms save to the database.
-   [ ] Subscription creation uses server-side prices.
-   [ ] Billing creates one invoice per due billing period.
-   [ ] Payment updates invoice balance and status.
-   [ ] Dashboard values come from real database aggregates.
-   [ ] Error, loading and empty states are implemented.
