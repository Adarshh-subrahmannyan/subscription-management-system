# Product Requirements Document (PRD)

## Subscription Management System

**Project:** Subscription Management System\
**Repository:** `Adarshh-subrahmannyan/subscription-management-system`\
**Product context:** Brightloop Software\
**Document owner:** Team Leader\
**Status:** Hackathon implementation baseline

------------------------------------------------------------------------

## 1. Product summary

Build one unified web platform for a subscription-based business to
manage products, pricing plans, quotations, customer subscriptions,
recurring invoices, discounts, payments and financial reporting.

The platform replaces disconnected spreadsheets and manual billing work
with a single source of truth.

## 2. Main problem

Brightloop Software sells products and services through monthly and
yearly subscriptions. Its current process is manual:

-   Customer subscriptions are tracked in spreadsheets.
-   Staff remember renewal dates manually.
-   Invoices are typed up every billing period.
-   Payments are matched to invoices by inspecting bank statements.
-   Revenue reports are assembled manually.

This creates missed renewals, incorrect invoices, unmatched payments and
poor visibility into recurring revenue, outstanding balances and overdue
invoices.

**Core problem to solve:** The company lacks one reliable system to
manage the full subscription lifecycle and the money associated with it.

## 3. Product goals

1.  Centralize customer, product, plan and subscription information.
2.  Support the complete subscription lifecycle.
3.  Generate invoices from subscriptions on their billing dates.
4.  Apply configured taxes and eligible discounts consistently.
5.  Record payments against the correct invoices.
6.  Show active subscriptions, collected revenue, outstanding balances
    and overdue invoices.
7.  Provide role-based access for administrators, staff and customers.
8.  Keep the application responsive as the number of subscriptions
    grows.

## 4. Users and permissions

### Admin

-   Full access to the system.
-   Create and manage products, variants, plans, taxes and discounts.
-   Create staff accounts.
-   View and manage customers, quotations, subscriptions, invoices,
    payments and reports.
-   Configure subscription rules.

### Staff

-   Handle day-to-day customer and subscription operations according to
    assigned permissions.
-   Create quotations and manage customer records where permitted.
-   View and process invoices and payments where permitted.
-   Cannot create staff accounts or administer restricted settings.

### Customer

-   Register and sign in.
-   View only their own profile, subscriptions, invoices and payment
    history.
-   Manage permitted subscription actions through a self-service portal.
-   Cannot access another customer's information.

Authorization must be enforced on the server/API, not only by hiding
frontend controls.

## 5. Functional requirements

### FR-01: Registration and authentication

-   Each email address can belong to only one account.
-   Password must be longer than eight characters and include uppercase,
    lowercase and a special character.
-   Provide password-reset flow through the registered email.
-   Support Admin, Staff and Customer roles.
-   Only Admin can add a Staff member.

### FR-02: Product management

Admin can create and manage products with: - Name - Type - Sales price -
Cost price - Notes - Variants

A selected variant may add an extra amount to the base price. Example
from the problem statement: selecting the Odoo brand adds 560 to the
price.

### FR-03: Plan management

Admin can configure: - Plan price - Billing frequency: daily, weekly,
monthly or yearly - Minimum quantity - Availability start and end
dates - Whether the plan closes automatically at its end - Whether early
closure, pause and renewal are allowed

### FR-04: Quotations

-   Create quotation templates with product and plan lines.
-   Set quotation validity in days.
-   Generate a quotation for a customer.
-   Show product, quantity, unit price, tax and line amount.
-   Convert an accepted quotation into a subscription.

### FR-05: Subscription lifecycle

Each subscription has: - Unique subscription number - Customer - Plan -
Start date - Expiry date - Payment terms - One or more lines containing
product, quantity, unit price, taxes and amount

Required lifecycle: `Draft → Quotation → Confirmed → Active → Closed`

Support pause, early closure and renewal according to the selected
plan's configuration. Define and validate allowed state transitions in
backend business logic.

### FR-06: Recurring billing and invoices

-   Identify subscriptions due for billing.
-   Generate invoices from subscription data.
-   Populate customer details, product lines, taxes and totals.
-   Support invoice actions: confirm, cancel, send and print.
-   Invoice lifecycle: `Draft → Confirmed → Paid`.
-   Prevent duplicate invoices for the same subscription billing period.
-   Ensure eligible subscriptions are not skipped.
-   Record billing attempts and failures for diagnosis/retry.

### FR-07: Taxes and discounts

-   Admin configures tax rules.
-   Calculate taxes on invoice lines and totals.
-   Support fixed-amount and percentage discounts.
-   Discount rules can include minimum purchase/quantity, start/end
    dates, usage limit and applicable products or subscriptions.
-   Apply eligible discounts automatically to the next invoice.
-   Stop applying a discount when expired or exhausted.

### FR-08: Payments

Record each payment with: - Payment method - Amount - Date -
Note/reference - Associated invoice

Support multiple payments against an invoice where applicable. Calculate
the remaining balance and show paid, partially paid, outstanding and
overdue states as appropriate. The source problem explicitly requires
paid and outstanding visibility and overdue follow-up.

### FR-09: Finance dashboard and reporting

Provide a summary view with: - Active subscription count - Revenue
received - Outstanding amount - Overdue invoices - Subscription and
invoice filters - Revenue/payment summaries

Clearly distinguish collected cash from invoiced amounts. Do not label
invoices issued as money received.

### FR-10: Performance

The problem statement requires every page to respond in under two
seconds even with thousands of subscriptions. Use pagination, database
indexes, selective queries and appropriate aggregation. Measure
performance rather than merely claiming compliance.

## 6. Non-functional requirements

-   Secure password storage and authenticated sessions.
-   Server-side role and ownership checks.
-   Input validation for all write operations.
-   Consistent error responses.
-   Transactional updates for invoice/payment operations.
-   Idempotent recurring billing to prevent duplicate invoices.
-   Audit-friendly timestamps and references.
-   Responsive desktop and mobile interface.
-   Pagination for large lists.
-   Environment secrets must not be committed to Git.

## 7. Core end-to-end acceptance scenario

A successful demo should show:

1.  Admin creates a product and a monthly plan.
2.  Customer registers and signs in.
3.  Staff creates a quotation for that customer.
4.  Quotation is confirmed and converted into a subscription.
5.  Subscription becomes active.
6.  Billing process identifies the subscription as due.
7.  One invoice is generated with correct customer, product, tax and
    discount details.
8.  A payment is recorded against the invoice.
9.  Invoice balance/status updates.
10. Finance dashboard reflects the subscription, collected payment and
    any remaining outstanding amount.

## 8. Suggested delivery priorities

### Must-have

-   Authentication and roles
-   Product and plan CRUD
-   Customer records
-   Subscription lifecycle
-   Invoice generation
-   Payment recording
-   Basic dashboard totals
-   Duplicate-billing protection

### Should-have

-   Quotations and templates
-   Tax rules
-   Discounts
-   Customer self-service portal
-   Overdue invoice filtering
-   Scheduled billing job

### Stretch goals

-   Payment gateway integration and webhooks
-   Automated email delivery
-   Advanced analytics
-   Exportable reports
-   More sophisticated retry/reconciliation workflows

## 9. Out of scope unless time permits

-   Full accounting/ERP replacement
-   Complex multi-currency accounting
-   Automated bank-statement import
-   Production-grade payment gateway certification
-   Advanced tax compliance for every jurisdiction

## 10. Open decisions to confirm before implementation

-   Currency and timezone for the demo.
-   Whether payments are simulated/manual or gateway-backed.
-   Whether partial payments are supported in the first release.
-   Exact tax calculation rules.
-   Whether customer registration creates a customer record
    automatically.
-   Which subscription actions customers can perform themselves.

These are implementation decisions; the supplied problem statement does
not specify all of them.
