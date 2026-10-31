import type { IconName } from "./icon";

type NavigationItem = Readonly<{
  href: string;
  label: string;
  icon: IconName;
}>;

type NavigationGroup = Readonly<{
  label: string;
  items: readonly NavigationItem[];
}>;

export const NAVIGATION_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "dashboard" }],
  },
  {
    label: "Sales and catalogue",
    items: [
      { href: "/products", label: "Products", icon: "package" },
      { href: "/plans", label: "Plans", icon: "layers" },
      { href: "/quotations", label: "Quotations", icon: "file" },
      { href: "/customers", label: "Customers", icon: "users" },
    ],
  },
  {
    label: "Subscriptions",
    items: [
      { href: "/subscriptions", label: "Subscriptions", icon: "repeat" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/invoices", label: "Invoices", icon: "receipt" },
      { href: "/payments", label: "Payments", icon: "card" },
      { href: "/discounts", label: "Discounts", icon: "discount" },
      { href: "/reports", label: "Reports", icon: "chart" },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/settings", label: "Settings", icon: "settings" }],
  },
] as const satisfies readonly NavigationGroup[];

export function getCurrentNavigation(pathname: string) {
  for (const group of NAVIGATION_GROUPS) {
    const item = group.items.find(
      ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
    );

    if (item) {
      return { group, item };
    }
  }

  return undefined;
}
