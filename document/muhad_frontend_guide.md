# Muhad --- Frontend Development Specification

## Subscription Management System

**File:** `muhad_frontend_guide.md`\
**Owner:** Muhad (Frontend Developer / Member 2)\
**Repository:** `Adarshh-subrahmannyan/subscription-management-system`\
**Primary responsibility:** Frontend UI/UX, responsive pages, reusable
components, client-side validation, and API integration.

------------------------------------------------------------------------

## 1. Project objective

Build the frontend for a subscription management platform used by a
software company to manage products, subscription plans, customers,
quotations, subscriptions, invoices, payments, discounts, and financial
reporting.

The frontend must support three user roles:

-   **Admin:** Full administrative interface.
-   **Staff:** Operational interface with permissions controlled by the
    backend.
-   **Customer:** Self-service portal for viewing and managing their own
    subscriptions, invoices, and payments.

The frontend must consume real backend data. Do not build the final
application around hardcoded arrays or static JSON. Temporary mock data
may be used during isolated UI development, but it must be clearly
separated and replaced by API integration.

## 2. Technology and implementation conventions

Use the project-approved stack:

-   Next.js App Router
-   React and TypeScript
-   Tailwind CSS
-   shadcn/ui (where installed)
-   Lucide icons
-   Recharts for charts
-   Zod for client-side form schemas where useful

Before adding or changing dependencies, coordinate with the team lead.
Do not independently replace the framework, package manager,
authentication system, or shared configuration.

### Coding rules

1.  Use TypeScript; avoid `any`.
2.  Prefer reusable components over duplicated page markup.
3.  Keep page components focused on composition and data loading.
4.  Keep API calls in a shared service/API layer rather than scattering
    `fetch()` calls throughout UI components.
5.  Keep forms controlled or use the form library selected by the team.
6.  Validate inputs on the client for usability, but treat backend
    validation as authoritative.
7.  Handle loading, empty, success, and error states on every
    data-driven page.
8.  Do not put secrets, database credentials, or private API keys in
    frontend code.
9.  Never store passwords or sensitive payment details in browser
    storage.
10. Follow existing naming and formatting conventions in the repository.

------------------------------------------------------------------------

## 3. Frontend ownership and boundaries

### Muhad owns

-   `src/app/(auth)/` --- login, registration, forgot-password UI
-   `src/app/(dashboard)/` --- admin/staff dashboard pages and layouts
-   `src/app/portal/` --- customer portal pages
-   `src/components/` --- reusable UI and feature components
-   `src/hooks/` --- reusable frontend hooks
-   Frontend styling, navigation, responsive behavior, and accessibility
-   API integration for frontend pages

### Coordinate before editing

These are shared contracts or files. Do not change them without
agreement:

-   `src/app/layout.tsx`
-   `src/app/globals.css`
-   `src/types/`
-   `src/lib/validations/`
-   `src/lib/auth.ts`
-   API route definitions and response formats
-   `prisma/schema.prisma`
-   `package.json`, `tsconfig.json`, and Next.js configuration

### Backend responsibilities

The backend owner is responsible for authentication enforcement,
authorization, database access, business rules, and API implementation.
The billing owner is responsible for billing, invoice, payment,
discount, and analytics calculations. The frontend displays those
results and submits user actions; it must not pretend that a client-side
calculation is the authoritative financial result.

------------------------------------------------------------------------

## 4. Required route and page inventory

Use the existing repository route structure as the source of truth. The
following is the intended UI inventory.

### A. Public/authentication routes

  -----------------------------------------------------------------------
  Route                   Page purpose            Main UI
  ----------------------- ----------------------- -----------------------
  `/login`                Sign in                 Email, password,
                                                  show/hide password,
                                                  submit, forgot-password
                                                  link

  `/register`             Customer registration   Name, email, password,
                                                  confirmation,
                                                  validation and terms
                                                  acknowledgement if
                                                  required

  `/forgot-password`      Request password reset  Email field and
                                                  confirmation state
  -----------------------------------------------------------------------

Frontend behavior: - Show field-level validation messages. - Disable
submit while a request is in progress. - Show useful error messages
without exposing server internals. - Do not reveal whether an email
account exists unless the backend's security design explicitly permits
it. - Redirect users based on the authenticated role and
backend-provided authorization. - Do not build staff account creation as
public registration. The problem requirements specify that staff
accounts are created by an admin.

### B. Admin/staff dashboard routes

  ------------------------------------------------------------------------
  Route                   Page purpose            Core content/actions
  ----------------------- ----------------------- ------------------------
  `/dashboard`            Business overview       KPI cards, revenue
                                                  chart, subscription
                                                  summary, invoice/payment
                                                  alerts

  `/products`             Product catalogue       Search, filters,
                                                  table/grid,
                                                  create/edit/view product

  `/products/new`         Create product          Product details, price,
                                                  cost, type, notes,
                                                  variants

  `/products/[id]`        Product details         Product information,
                                                  variants, related plans

  `/plans`                Subscription plans      Plan list, price,
                                                  billing interval,
                                                  availability and status

  `/plans/new`            Create plan             Pricing, frequency,
                                                  minimum quantity,
                                                  availability and
                                                  lifecycle settings

  `/subscriptions`        Subscription management Search, filters, status,
                                                  customer, plan, next
                                                  billing date

  `/subscriptions/new`    Create subscription     Customer, plan/product,
                                                  quantity, dates,
                                                  quotation/confirmation
                                                  flow

  `/subscriptions/[id]`   Subscription details    Status timeline, lines,
                                                  customer, billing dates,
                                                  actions

  `/quotations`           Quotation management    List, status, customer,
                                                  validity, totals,
                                                  create/view actions

  `/customers`            Customer management     Search, filters,
                                                  customer list and status

  `/customers/[id]`       Customer details        Profile, subscriptions,
                                                  invoices, payment
                                                  history

  `/invoices`             Invoice management      Invoice number,
                                                  customer, date, due
                                                  date, amount, status

  `/invoices/[id]`        Invoice details         Line items, tax,
                                                  discount, totals,
                                                  payment status,
                                                  print/send actions

  `/payments`             Payment management      Payment list, method,
                                                  amount, date, linked
                                                  invoice, status

  `/discounts`            Discount rules          Fixed/percentage rules,
                                                  eligibility, validity,
                                                  usage limits

  `/reports`              Finance reports         Revenue, outstanding,
                                                  overdue, subscription
                                                  and payment reporting

  `/settings`             Application settings    Profile and permitted
                                                  organization/settings
                                                  controls
  ------------------------------------------------------------------------

The staff interface must respect backend permissions. Hiding an action
in the UI is not a security boundary; the backend must enforce
authorization.

### C. Customer portal routes

  -------------------------------------------------------------------------
  Route                     Page purpose            Core content/actions
  ------------------------- ----------------------- -----------------------
  `/portal/dashboard`       Customer overview       Active subscriptions,
                                                    upcoming renewal,
                                                    unpaid invoices

  `/portal/subscriptions`   My subscriptions        Customer's own
                                                    subscriptions,
                                                    statuses, dates and
                                                    permitted actions

  `/portal/invoices`        My invoices             Invoice list, amounts,
                                                    due dates, statuses,
                                                    view/download

  `/portal/payments`        My payments             Payment history and
                                                    linked invoices
  -------------------------------------------------------------------------

A customer must never see another customer's records. The API must scope
data to the authenticated customer; frontend filtering alone is
insufficient.

------------------------------------------------------------------------

## 5. Shared dashboard shell

Build one consistent dashboard shell for admin/staff pages.

### Sidebar navigation

Suggested groups:

**Overview** - Dashboard

**Sales and catalogue** - Products - Plans - Quotations - Customers

**Subscriptions** - Subscriptions

**Finance** - Invoices - Payments - Discounts - Reports

**Administration** - Settings

Requirements: - Active route indicator. - Collapsible sidebar on
desktop. - Drawer navigation on small screens. - Clear icons and
labels. - User profile/menu at the bottom or in the header. - Do not
show links the current role is not permitted to access, while still
relying on backend authorization.

### Top navigation/header

Include: - Page title or breadcrumb - Search only where it has a defined
behavior - Notifications area only if supported - User avatar/name and
account menu - Mobile sidebar toggle

### Main content area

Use a consistent page pattern: 1. Breadcrumb or page title 2. Short page
description where useful 3. Primary action button 4. Filters/search 5.
Main table, cards, or form 6. Pagination where needed

------------------------------------------------------------------------

## 6. Page-level UI requirements

### 6.1 Dashboard

Show financial and operational information from the backend.

Suggested KPI cards: - Active subscriptions - Total subscriptions -
Revenue received - Outstanding amount - Overdue invoices

Suggested charts/sections: - Revenue over time - Subscription status
distribution - Recent invoices - Recent payments - Upcoming renewals or
overdue items

Important distinctions: - **Revenue received** means payments actually
collected, not merely invoices issued. - **Outstanding amount** means
the unpaid balance. - **Overdue invoices** are invoices past their due
date and not fully paid. - Do not invent or calculate authoritative
financial totals from incomplete client-side data.

Provide date-range filters if the reporting API supports them. Show
currency and date formats consistently.

### 6.2 Products

Product list: - Product name - Product type - Sales price - Cost price
(only for roles allowed to see it) - Variant count - Status - Actions

Product form: - Name - Type - Sales price - Cost price -
Notes/description - Variants and variant-specific additional price

Example variant behavior: if a selected variant adds ₹560, display the
updated estimated line price. The backend must confirm the final price
when creating the quotation/subscription/invoice.

### 6.3 Plans

Plan list: - Plan name - Related product - Price - Billing frequency -
Status/availability - Actions

Plan form should cover supported requirements: - Subscription price -
Billing frequency: daily, weekly, monthly, yearly - Minimum quantity -
Availability start and end dates - Automatic closure setting - Pause,
early closure, and renewal options where supported

Use clear controls and helper text for lifecycle settings. Do not
silently assume defaults that affect billing.

### 6.4 Quotations

Quotation list: - Quotation reference - Customer - Created date - Valid
until - Total - Status

Quotation creation/detail: - Customer information - Product/plan
selection - Quantity - Unit price - Tax - Discount - Total - Validity
period

Display a clear summary before submission. The server must calculate and
validate final amounts.

### 6.5 Subscriptions

Subscription list: - Unique subscription number - Customer -
Plan/product - Quantity - Start date - Next billing date - Status

Subscription detail: - Customer and plan information - Subscription
lines - Billing interval - Start/end/renewal dates - Lifecycle
timeline - Permitted actions: confirm, activate, pause, resume, close,
renew, or request a change, depending on role and backend rules

Show status labels consistently. The status lifecycle described in the
problem statement is:

`Draft → Quotation → Confirmed → Active → Closed`

Do not let the UI transition statuses arbitrarily. Only expose valid
actions returned or permitted by backend rules.

### 6.6 Invoices

Invoice list: - Invoice number - Customer - Invoice date - Due date -
Total - Amount paid / balance due, if returned - Status

Invoice detail: - Company and customer information - Invoice number and
dates - Product/service lines - Quantity and unit price - Tax
breakdown - Discount - Subtotal and total - Payments applied - Remaining
balance - Actions: confirm, cancel, send, print/download, where
permitted

The stated invoice lifecycle is:

`Draft → Confirmed → Paid`

If partial payment is supported by the backend, display a
partial/outstanding state or payment summary without incorrectly
labelling the invoice as fully paid.

### 6.7 Payments

Display: - Payment reference - Customer - Linked invoice - Payment
method - Amount - Payment date - Notes - Status

Support viewing multiple payments against one invoice. Example: a ₹5,000
invoice may have ₹3,000 and ₹2,000 payments. Show the combined amount
paid and remaining balance based on backend values.

Do not collect or store raw card details in the frontend.

### 6.8 Discounts

Discount list/form: - Discount name/code if supported - Fixed amount or
percentage - Minimum purchase amount - Minimum quantity - Start/end
dates - Maximum usage count - Eligible products/subscriptions -
Active/expired/exhausted status

Clearly display why a discount is not eligible when the backend provides
that reason. The server decides whether a discount applies and
calculates its value.

### 6.9 Reports

Suggested report sections: - Revenue received over time - Outstanding
invoices - Overdue invoices - Payment history - Subscription
counts/statuses - Filters by date, customer, subscription, or status
where supported

Charts must have labels, legends, tooltips, and useful empty states.
Provide a table or textual summary so data is not communicated only by
color or chart shape.

### 6.10 Customer portal

Keep the customer experience simpler than the admin dashboard.

Customer home: - Welcome/header - Active subscription summary - Next
renewal date - Outstanding invoices - Recent payments

Customers can view only their own records and use only actions allowed
by the backend. If pause/cancel/change requests require staff approval,
label them as requests rather than implying immediate completion.

------------------------------------------------------------------------

## 7. Reusable component inventory

Create reusable components under `src/components/`.

### Layout

-   `layout/sidebar.tsx`
-   `layout/navbar.tsx`
-   `layout/dashboard-layout.tsx`
-   `layout/page-header.tsx`
-   `layout/breadcrumbs.tsx`

### Shared UI

-   `shared/data-table.tsx`
-   `shared/search-input.tsx`
-   `shared/filter-bar.tsx`
-   `shared/status-badge.tsx`
-   `shared/confirm-dialog.tsx`
-   `shared/empty-state.tsx`
-   `shared/error-state.tsx`
-   `shared/loading-state.tsx`
-   `shared/page-pagination.tsx`
-   `shared/currency-display.tsx`
-   `shared/date-display.tsx`

### Dashboard

-   `dashboard/stat-card.tsx`
-   `dashboard/revenue-chart.tsx`
-   `dashboard/subscription-chart.tsx`
-   `dashboard/recent-invoices.tsx`
-   `dashboard/recent-payments.tsx`

### Feature components

-   `products/product-form.tsx`
-   `products/product-table.tsx`
-   `plans/plan-form.tsx`
-   `subscriptions/subscription-form.tsx`
-   `subscriptions/subscription-timeline.tsx`
-   `invoices/invoice-table.tsx`
-   `invoices/invoice-summary.tsx`
-   `payments/payment-table.tsx`
-   `shared/customer-select.tsx`
-   `shared/product-plan-select.tsx`

Component filenames can be adjusted to match the existing codebase.
Avoid creating duplicate components if shadcn/ui or an existing shared
component already provides the functionality.

------------------------------------------------------------------------

## 8. Design system and visual direction

Create a professional B2B SaaS interface. The design should feel
reliable, clear, data-oriented, and easy to operate.

### Visual principles

-   Consistent spacing and alignment.
-   Clear typography hierarchy.
-   Restrained use of color.
-   Strong contrast for important financial values.
-   Tables that remain readable with many records.
-   Forms grouped into logical sections.
-   Consistent button sizes and interaction states.
-   Avoid excessive gradients, animations, glass effects, and decorative
    elements that reduce readability.

### Suggested visual tokens

Treat these as starting suggestions, not fixed brand requirements.
Confirm with the team before changing global styles.

-   App background: light neutral gray
-   Main surfaces: white
-   Primary text: dark slate
-   Secondary text: muted slate
-   Primary action: blue or indigo
-   Success: green
-   Warning: amber
-   Destructive/error: red
-   Borders: subtle neutral gray

Use semantic status colors consistently: - Active/paid: success -
Pending/draft: neutral - Due soon: warning - Overdue/failed/cancelled:
destructive or clearly distinct neutral status

Never rely on color alone; always include text labels or icons with
accessible names.

### Typography and spacing

-   Use one consistent font family.
-   Use a clear page title, section heading, body, helper-text
    hierarchy.
-   Use a consistent spacing scale.
-   Keep tables compact but not cramped.
-   Ensure financial figures use tabular numerals when possible.

### Responsive behavior

-   Desktop: persistent or collapsible sidebar.
-   Tablet: compact sidebar or drawer.
-   Mobile: drawer navigation, stacked KPI cards, horizontally
    scrollable or card-based tables, full-width forms.
-   Avoid fixed-width layouts that cause page-level horizontal
    scrolling.

------------------------------------------------------------------------

## 9. Frontend states and interaction requirements

Every API-driven screen must account for:

1.  **Initial/loading:** skeleton or progress indicator.
2.  **Success with data:** render records.
3.  **Empty:** explain that no records exist and provide a relevant
    action.
4.  **Error:** show a safe, actionable message and retry option where
    appropriate.
5.  **Submitting:** disable duplicate submission and show progress.
6.  **Success feedback:** toast or inline confirmation.
7.  **Permission denied:** show an appropriate message or redirect.
8.  **Not found:** show a useful not-found state for invalid record IDs.

For destructive actions such as cancel subscription, close subscription,
cancel invoice, or delete product: - Ask for confirmation. - Explain the
consequence. - Prevent accidental double submission. - Display the
backend result.

Use optimistic updates only when safe and reversible. For financial and
lifecycle actions, prefer waiting for server confirmation.

------------------------------------------------------------------------

## 10. API integration contract

Coordinate exact endpoint paths and response shapes with the backend
developers before implementation. The following is a suggested
frontend-facing contract, not a claim that these endpoints already
exist.

  Feature          Suggested operation
  ---------------- --------------------------------------------------
  Authentication   Sign in, sign out, current session
  Products         List, create, read, update, archive
  Plans            List, create, read, update
  Customers        List, read, update permitted profile fields
  Quotations       List, create, read, confirm/send where supported
  Subscriptions    List, create, read, lifecycle action
  Invoices         List, read, confirm/cancel/send where supported
  Payments         List, read, record payment if role permits
  Discounts        List, create, update, deactivate
  Analytics        Dashboard KPIs and report queries

### API integration rules

-   Use the agreed API base URL and shared API client.
-   Send credentials/session data using the authentication method
    selected by the backend.
-   Handle `401` by redirecting to login or refreshing the session as
    designed.
-   Handle `403` as an authorization failure.
-   Handle `404` as missing data.
-   Handle `409` for conflicts or duplicate operations where applicable.
-   Handle `422` or validation responses by mapping field errors to
    forms.
-   Handle `5xx` with a generic error and retry guidance.
-   Use server pagination, sorting, and filtering for large datasets.
-   Do not fetch every record just to filter it in the browser.
-   Do not assume a successful request until the server responds
    successfully.

### Suggested response shape

Agree on a consistent shape with backend developers, for example:

``` ts
type ApiError = {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
```

The team may choose another response format; consistency is more
important than this exact example.

------------------------------------------------------------------------

## 11. TypeScript frontend models

These are illustrative UI-facing types. Align them with the actual
Prisma/API schema; do not duplicate or independently redefine business
rules.

``` ts
type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

type SubscriptionStatus =
  | "DRAFT"
  | "QUOTATION"
  | "CONFIRMED"
  | "ACTIVE"
  | "CLOSED";

type InvoiceStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PAID";

type BillingFrequency =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

type DiscountType = "FIXED" | "PERCENTAGE";
```

Important: - Confirm exact enum spelling/casing with the backend. - Use
ISO date strings in API payloads unless the API contract says
otherwise. - Use decimal-safe server values for money. Do not use
JavaScript floating-point arithmetic as the authoritative financial
calculation. - Format currency using `Intl.NumberFormat` based on the
configured currency. - Never assume all customers use INR unless the
product requirements/configuration confirm it.

------------------------------------------------------------------------

## 12. Accessibility and usability

-   Use semantic HTML (`button`, `label`, `nav`, `main`, `table`, etc.).
-   Every input must have a visible or programmatic label.
-   Ensure keyboard navigation works.
-   Provide visible focus indicators.
-   Dialogs must support keyboard focus management.
-   Use accessible names for icon-only buttons.
-   Maintain sufficient text/background contrast.
-   Do not communicate status using color alone.
-   Use descriptive validation messages.
-   Make tables usable on narrow screens.
-   Respect reduced-motion preferences.

------------------------------------------------------------------------

## 13. Performance requirements

The problem statement calls for pages to respond in under two seconds
even with thousands of subscriptions. Frontend work should support this
target:

-   Use server-side pagination for large tables.
-   Request only the fields required by each view.
-   Debounce search input.
-   Avoid unnecessary re-renders.
-   Lazy-load heavy charts or noncritical sections where appropriate.
-   Use skeletons rather than blocking the entire page.
-   Avoid loading every invoice, customer, or subscription at once.
-   Use Next.js image optimization for actual image assets.
-   Keep dependencies lean.
-   Measure performance rather than claiming a page meets the target
    without testing.

Backend query performance is also essential; frontend optimization alone
cannot guarantee the two-second requirement.

------------------------------------------------------------------------

## 14. Suggested frontend folder ownership

``` text
src/
├── app/
│   ├── (auth)/                 # Muhad: authentication pages
│   ├── (dashboard)/            # Muhad: admin/staff UI pages
│   ├── portal/                 # Muhad: customer portal
│   └── api/                    # Coordinate; backend-owned route handlers
│
├── components/                 # Muhad: reusable UI
│   ├── ui/                     # shared primitives
│   ├── layout/                 # sidebar, navbar, page shell
│   ├── dashboard/              # KPI cards and charts
│   ├── products/
│   ├── plans/
│   ├── subscriptions/
│   ├── invoices/
│   ├── payments/
│   └── shared/
│
├── hooks/                      # Muhad: frontend hooks
├── types/                      # Shared; coordinate with backend
└── lib/
    ├── api/                    # Shared API client (agree with team)
    └── utils.ts                # Shared utilities; coordinate
```

If `src/lib/api/` does not exist, propose it to the team before adding
it. Keep API client code separate from UI components.

------------------------------------------------------------------------

## 15. Git workflow --- single `main` branch

The hackathon submission instructions require one branch. All team
members should work against `main`; do not create feature branches
unless the organizers/team lead explicitly changes this rule.

Before starting work:

``` bash
git switch main
git pull --rebase origin main
```

After completing a small, working unit:

``` bash
git status
git add <your-owned-files>
git commit -m "feat(frontend): add dashboard layout"
git pull --rebase origin main
git push origin main
```

Use meaningful commit messages, for example:

``` text
feat(frontend): add responsive dashboard shell
feat(frontend): build product management screens
feat(frontend): add subscription list and details
feat(frontend): implement customer portal
fix(frontend): handle invoice loading and error states
style(frontend): improve mobile navigation
```

### Single-branch coordination rules

1.  Tell the team before pushing.
2.  Only one person should push at a time.
3.  Pull the latest `main` before starting and again before pushing.
4.  Stage only your own files; avoid `git add .` if other members have
    uncommitted work in the shared working directory.
5.  Do not overwrite another member's changes.
6.  If a conflict occurs, stop and coordinate before resolving it.
7.  Do not commit `.env` or secrets.
8.  Commit small working increments instead of one huge final commit.

**Important:** If all three people are using separate local clones, they
can develop in parallel, but they must coordinate pushes. If all three
are sharing one computer/working directory, do not run concurrent Git
operations.

------------------------------------------------------------------------

## 16. Definition of done for each frontend page

A page is not complete merely because it looks correct.

Before marking it done, verify:

-   [ ] Route loads without errors.
-   [ ] Layout works on desktop, tablet, and mobile.
-   [ ] Data comes from the agreed API or clearly labelled temporary
    mock service.
-   [ ] Loading state works.
-   [ ] Empty state works.
-   [ ] Error state works.
-   [ ] Form validation works.
-   [ ] Submit buttons prevent duplicate submissions.
-   [ ] Success and failure feedback are visible.
-   [ ] Role/permission behavior is respected.
-   [ ] Keyboard and focus behavior are usable.
-   [ ] No console errors or TypeScript errors.
-   [ ] No secrets or private data are exposed.
-   [ ] Changes are committed and pushed to `main`.

------------------------------------------------------------------------

## 17. Recommended implementation order for Muhad

Build the shared foundation first, then pages in this order:

### Phase 1 --- Frontend foundation

1.  Inspect the existing repository and preserve its current setup.
2.  Confirm Next.js, TypeScript, Tailwind, and shadcn/ui status.
3.  Confirm global styles and typography.
4.  Build the shared dashboard shell.
5.  Build sidebar, navbar, breadcrumbs, page header.
6.  Add shared loading, empty, error, status, and table components.

### Phase 2 --- Main dashboard and catalogue

1.  Dashboard overview with API-driven KPI placeholders/contracts.
2.  Product list and product form.
3.  Plan list and plan form.
4.  Customer list and customer details.

### Phase 3 --- Subscription and sales workflow

1.  Quotation list and form/detail.
2.  Subscription list.
3.  Subscription creation form.
4.  Subscription detail and lifecycle timeline.

### Phase 4 --- Finance interface

1.  Invoice list and detail.
2.  Payment list and details.
3.  Discount list and form.
4.  Reports and charts.

Coordinate these pages with the billing teammate so the frontend matches
actual API capabilities.

### Phase 5 --- Customer portal

1.  Customer dashboard.
2.  Customer subscription list/details.
3.  Customer invoice list/details.
4.  Customer payment history.

### Phase 6 --- Integration and polish

1.  Replace temporary mock services with real APIs.
2.  Verify role-based navigation and API authorization behavior.
3.  Test complete customer-to-subscription-to-invoice-to-payment flow.
4.  Fix responsive and accessibility issues.
5.  Check performance with realistic data volume.
6.  Verify production build.

------------------------------------------------------------------------

## 18. Vibe-coding instructions for an AI coding assistant

Use this document as the frontend source of truth when prompting an AI
coding assistant.

### Rules for the coding assistant

-   Read this file before making frontend changes.
-   Inspect the existing repository before creating, moving, or
    replacing files.
-   Do not rewrite the whole application when asked to implement one
    feature.
-   Work in small, reviewable steps.
-   Preserve existing working code and dependencies.
-   Do not invent API endpoints or database fields. Ask for or inspect
    the agreed contract.
-   Do not implement backend business logic in frontend components.
-   Do not hardcode dashboard metrics or pretend mock data is live.
-   Keep components reusable and TypeScript types explicit.
-   Do not edit files owned by other teammates without coordination.
-   Do not change the Git branch strategy.
-   Run lint/type checks and report any remaining errors.
-   Summarize files changed, behavior implemented, API assumptions, and
    tests performed.

### Reusable prompt template

``` text
Read muhad_frontend_guide.md completely before starting.

Task: [describe one frontend feature]

First inspect the existing files and relevant API contracts.
Do not overwrite unrelated work or change shared configuration without asking.
Implement this feature using the existing stack and conventions.
Include loading, empty, error, validation, and responsive states.
Use real API integration only when the endpoint contract is confirmed.
Do not invent backend behavior or hardcode production data.

After implementation:
1. List files created/modified.
2. Explain the implementation briefly.
3. Report API assumptions.
4. Run available lint/type checks.
5. Report errors or unfinished work.
Do not commit or push unless explicitly asked.
```

------------------------------------------------------------------------

## 19. Immediate first task

Start with the dashboard shell only. Do not build all pages at once.

**Task:** Implement the responsive admin dashboard layout.

Expected deliverables: - Sidebar with the agreed navigation groups. -
Mobile navigation drawer. - Header/navbar with user menu. - Main content
container. - Breadcrumb/page title pattern. - Reusable KPI card
component. - Consistent spacing, typography, and color tokens. -
Responsive behavior. - No fake live metrics; use a clearly labelled
placeholder until the dashboard API is ready.

Once this foundation is reviewed, proceed to product and plan management
pages.

------------------------------------------------------------------------

## 20. Important assumptions to confirm with the team

The frontend requirements above are based on the subscription-management
problem summary and the agreed team structure. Confirm these points with
the backend owner before final integration:

1.  Exact API endpoint paths and response shapes.
2.  Exact role names and permission matrix.
3.  Whether customer registration is open or invitation/approval based.
4.  Supported currency and tax display rules.
5.  Whether payment is recorded manually, through a gateway, or both.
6.  Which subscription actions customers can perform directly versus
    request from staff.
7.  Exact invoice and subscription status enums.
8.  Whether invoice PDF generation is handled by the backend.
9.  Whether report filters and exports are supported.
10. Which pages are required for the hackathon minimum viable
    demonstration.

**Frontend success criterion:** A user can navigate the application,
understand each subscription workflow, submit valid actions, see
accurate server-provided results, and use the interface comfortably on
desktop and mobile.
