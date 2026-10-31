"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/layout/icon";
import type { IconName } from "@/components/layout/icon";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/portal/dashboard",      label: "Home",      icon: "home"     },
  { href: "/portal/subscriptions",  label: "My Plans",  icon: "repeat"   },
  { href: "/portal/invoices",       label: "Invoices",  icon: "receipt"  },
  { href: "/portal/payments",       label: "Payments",  icon: "card"     },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Portal navigation"
      className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border safe-pb lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[0.65rem] font-semibold tracking-wide transition-colors",
                isActive ? "text-brand" : "text-ink-faint hover:text-ink-muted",
              ].join(" ")}
            >
              <Icon
                name={item.icon}
                className={`h-5 w-5 transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
              />
              <span>{item.label}</span>
              {/* Active indicator dot */}
              <span
                className={`h-1 w-1 rounded-full bg-brand transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0"}`}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
