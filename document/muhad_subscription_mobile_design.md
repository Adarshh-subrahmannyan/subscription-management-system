# Mobile Subscription Management App — UI Design Specification

**Reference:** Uploaded two-screen mobile UI concept  
**Purpose:** Frontend implementation guide for the Subscription Management System  
**Status:** Design interpretation from the supplied reference image; measurements and colors are approximate.

---

## 1. Design direction

Create a clean, premium-feeling subscription app with a light neutral background, white rounded cards, dark navy typography, and a strong red accent for primary actions and subscription branding.

The reference shows two mobile screens:

1. **Home / subscriptions overview** — greeting, weekly offer, recent subscriptions, and bottom navigation.
2. **Subscription summary** — selected service details, monthly spending chart, subscriber/member breakdown, and renewal action.

The visual language should feel calm and uncluttered. Use generous whitespace, soft card edges, restrained shadows, and clear typographic hierarchy.

## 2. Visual system

### Color palette

Use these as starting values and tune them against the reference during implementation.

| Token | Suggested value | Usage |
|---|---|---|
| App background | `#F3F3F6` | Main screen background |
| Surface | `#FFFFFF` | Cards, icon buttons, navigation |
| Primary text | `#111827` | Headings, prices, important labels |
| Secondary text | `#8B9098` | Captions, dates, helper text |
| Accent red | `#D7191C` | Main CTA, offer panel, chart bars |
| Accent blue | `#4778F5` | Section navigation arrows |
| Divider / subtle border | `#ECEEF1` | Separators and subtle outlines |
| Soft shadow | `rgba(17, 24, 39, 0.06)` | Floating cards and controls |

Do not use the red accent for every interactive element. Reserve it for primary actions and subscription emphasis; use neutral surfaces for secondary controls.

### Typography

Use a modern sans-serif such as **Inter**, **Manrope**, or the platform system font.

| Element | Suggested style |
|---|---|
| Screen title / section title | 20–22 px, semibold or bold |
| Greeting | 13–14 px, regular, secondary color |
| User name | 16–17 px, semibold |
| Card title | 15–16 px, semibold |
| Price | 20–22 px, bold |
| Supporting text | 12–14 px, regular |
| Chart labels | 11–12 px, regular |

Use consistent line heights and avoid overly light font weights for important information.

### Shape, spacing, and elevation

- Use a spacing scale based on 4 px: `4, 8, 12, 16, 20, 24, 32`.
- Main content horizontal padding: approximately 22–26 px on a phone-sized viewport.
- Card radius: approximately 18–22 px.
- Small icon/avatar containers: circular or rounded-square.
- Primary CTA: large rounded rectangle, approximately 16–20 px radius.
- Shadows should be very soft. Prefer subtle elevation over visible borders.
- Maintain clear vertical gaps between sections.

## 3. Screen A — Home / subscriptions overview

### Layout hierarchy

1. Safe area and status bar
2. User greeting header
3. Weekly offer section
4. Recent subscriptions section
5. Fixed bottom navigation

### Header

- Left: circular user avatar.
- Beside avatar: muted greeting text, then user's display name in a stronger weight.
- Right: circular notification button with a bell icon.
- Keep the header compact and vertically centered.
- The greeting and name should remain readable on narrow devices; truncate the name only if necessary.

### Weekly offer section

- Section label: “Offer Of” on the first line and “The Week” emphasized on the next line.
- Place a blue right-arrow action at the far right of the section heading.
- Under the heading, show one prominent offer card.

**Offer card composition**

- White rounded card with a horizontal layout.
- Left offer strip: red background, service logo in a white circular field, and a small expiry/date caption near the bottom.
- Right content area:
  - Service name (example shown: Netflix)
  - Plan name (example shown: Family Pack)
  - Price (example shown: `$9.00`)
  - Billing interval (example shown: `Per Month`)
  - Red circular add button with a white plus icon, aligned toward the lower-right.
- Keep the card content vertically balanced.
- On smaller widths, allow the right-side text to wrap while preserving the add button's tap target.

### Recent subscriptions section

- Section heading: “Recent” above the bold “Subscriptions”.
- Blue right-arrow action aligned to the heading's right.
- Render subscription items as separate white rounded cards.

Each subscription row contains:

- Service icon in a rounded-square tile.
- Service name.
- Last activity / billing date and time in muted small text.
- Price aligned to the right.
- Billing period (example: `/month`) beneath the price.

The reference displays two rows (YouTube Music and HBO). The implementation should support a dynamic list, not hard-code those examples.

### Bottom navigation

- Fixed white navigation container near the bottom safe area.
- Four evenly distributed icon destinations:
  1. Home
  2. Analytics / spending
  3. Calendar / billing schedule
  4. Profile
- Use a dark icon for the active destination and muted gray icons for inactive destinations.
- Keep the navigation bar visually separate from scrolling content.
- Ensure the bar respects iOS/Android bottom safe-area insets.

## 4. Screen B — Subscription summary

### Layout hierarchy

1. Safe area and top navigation
2. Service identity block
3. Monthly spending chart
4. Subscriber / member summary
5. Bottom renewal action

### Top navigation

- Back button in a circular white control on the left.
- Centered screen title: “Summery” as written in the supplied reference. Confirm whether the intended product copy should be “Summary” before release.
- Notification bell in a circular white control on the right.
- Keep the title visually centered regardless of the side controls' widths.

### Service identity

- Center the service logo inside a white rounded-square tile.
- Place service name below the logo in bold dark text.
- Show the service website or provider URL as a muted secondary line.
- Use the actual selected subscription's data; do not hard-code the sample service.

### Spending chart

- Show a compact vertical bar chart for monthly subscription cost.
- The reference displays month labels from March through October.
- Use red bars with rounded ends and no heavy chart grid.
- Place value labels along the left side in muted gray.
- Keep month labels directly below the bars.
- Chart should resize to the available width and avoid label overlap on narrow screens.
- Use real billing or payment history when available. If data is unavailable, show an explicit empty state rather than fabricated values.

### Member / subscriber summary

- White rounded card containing a horizontal row of member summaries.
- Each member item includes:
  - Circular avatar
  - Name
  - Amount associated with that member
- The reference shows four members. Support fewer or more members with horizontal scrolling or a responsive wrap.
- Use consistent avatar sizing and centered text.
- Format all amounts using the system currency and locale.

### Renewal CTA

- Large red button spanning nearly the full content width.
- Example label: `Renew For $40/month`.
- Make the action clear and ensure the amount and billing interval are legible.
- The button should trigger the renewal flow only after the user confirms the subscription and price.
- Include loading, success, and error states.
- If the subscription is not eligible for renewal, replace the CTA with the appropriate status or next action.

## 5. Interaction requirements

| Element | Expected behavior |
|---|---|
| Notification icon | Opens notifications |
| Offer arrow | Opens the offers listing or offer details |
| Add button | Opens offer selection / add-subscription flow |
| Recent subscriptions arrow | Opens the full subscriptions list |
| Subscription row | Opens that subscription's detail screen |
| Bottom navigation | Switches between the four main app sections |
| Back button | Returns to the previous screen |
| Chart | Displays actual historical billing data; optional tooltip on bar tap |
| Member item | Opens member details if that capability exists |
| Renew button | Starts a confirmation and renewal flow |

All interactive controls must have accessible labels and sufficiently large touch targets (aim for at least 44 × 44 px).

## 6. Responsive behavior

The reference is a phone-first design. Implement mobile layouts first, then adapt for larger viewports.

- **Small phones:** reduce horizontal padding slightly; preserve readable type and touch targets; allow content to scroll vertically.
- **Standard phones:** match the reference's card widths and section spacing.
- **Large phones:** keep content centered with a sensible maximum width rather than stretching cards edge-to-edge.
- **Tablet / desktop:** use a centered content column or a wider dashboard layout. Do not simply enlarge every mobile component.
- Keep the bottom navigation fixed only on the mobile layout. For wider layouts, consider a persistent side navigation if that matches the wider product architecture.
- Avoid fixed heights for content cards; allow text and lists to grow naturally.

## 7. Reusable frontend components

Suggested component breakdown:

```text
components/
  mobile/
    MobileAppShell.tsx
    BottomNavigation.tsx
    ScreenHeader.tsx
    NotificationButton.tsx
  subscriptions/
    UserGreeting.tsx
    OfferOfTheWeekCard.tsx
    RecentSubscriptionList.tsx
    SubscriptionListItem.tsx
    SubscriptionIdentity.tsx
    MonthlySpendingChart.tsx
    MemberSummaryCard.tsx
    MemberSummaryItem.tsx
    RenewSubscriptionButton.tsx
```

Keep components data-driven. Pass service names, logos, prices, dates, members, and chart points through props or API data.

## 8. Suggested data contracts

These are frontend-facing examples only. Confirm field names and business rules with the backend team before integrating.

```ts
type SubscriptionSummary = {
  id: string;
  serviceName: string;
  logoUrl?: string;
  planName?: string;
  websiteUrl?: string;
  amount: number;
  currency: string;
  billingInterval: "daily" | "weekly" | "monthly" | "yearly";
  status: "active" | "paused" | "closed" | "pending";
  nextBillingDate?: string;
};

type RecentSubscription = {
  id: string;
  serviceName: string;
  logoUrl?: string;
  amount: number;
  currency: string;
  billingInterval: string;
  lastActivityAt?: string;
};

type SpendingPoint = {
  month: string;
  amount: number;
};

type SubscriptionMember = {
  id: string;
  name: string;
  avatarUrl?: string;
  amount: number;
  currency: string;
};
```

The sample dollar values and brand names in the reference are illustrative. Use the application's actual currency, subscription records, and branding.

## 9. States to implement

For every data-driven section, implement:

- Loading state (skeletons or restrained progress indicator)
- Populated state
- Empty state with a useful next action
- Error state with retry where appropriate
- Long-content state (long names, large amounts, many subscriptions or members)

Also account for:

- Missing service logo (show a branded initials/icon fallback)
- Missing avatar (show initials or a neutral avatar)
- Zero or negative chart values (render safely and clearly)
- Currency formatting and locale differences
- Paused, expired, closed, and renewal-ineligible subscriptions

## 10. Accessibility and quality checks

- Use semantic headings in the correct order.
- Provide accessible names for icon-only buttons.
- Maintain sufficient contrast between text and backgrounds.
- Do not communicate status using color alone; include text labels where needed.
- Support dynamic text sizing without clipping.
- Ensure chart information is available in a text or tabular alternative.
- Test keyboard navigation where applicable and screen-reader labels for controls.
- Check layout at narrow widths and with long translated strings.

## 11. Implementation sequence

1. Build the mobile app shell, safe-area handling, typography, colors, and spacing tokens.
2. Implement the home header and weekly offer card using mock data.
3. Implement recent subscription rows and the fixed bottom navigation.
4. Implement the subscription summary identity block.
5. Add the spending chart and member summary card.
6. Implement the renewal confirmation flow and all button states.
7. Replace mock data with agreed API contracts.
8. Test responsive behavior, accessibility, loading, empty, and error states.

## 12. Scope and ownership notes

This document describes the **frontend presentation and interaction layer** only.

- Frontend work: page layouts, reusable UI components, responsive behavior, form validation feedback, loading/error/empty states, and API integration.
- Backend work: authentication and authorization logic, subscription lifecycle rules, billing calculations, payment processing, renewal eligibility, and persistence.
- Confirm the final API endpoints, roles, and data contracts with the backend and billing owners.
- Do not calculate authoritative invoice totals or renewal eligibility solely in the client.

---

**Design acceptance checklist**

- [ ] Home screen matches the reference hierarchy and visual style.
- [ ] Offer card and subscription rows use dynamic data.
- [ ] Bottom navigation respects device safe areas.
- [ ] Summary screen shows the selected service and its actual history.
- [ ] Chart labels remain readable on small screens.
- [ ] Member list adapts to varying member counts.
- [ ] Renewal action has confirmation and clear success/error feedback.
- [ ] Loading, empty, and error states are implemented.
- [ ] All icon-only controls have accessible labels.
- [ ] Layout is tested on small, standard, and large mobile viewports.
