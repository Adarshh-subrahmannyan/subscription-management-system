"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_GROUPS } from "./navigation";
import { Icon } from "./icon";

type SidebarProps = Readonly<{
  isCollapsed: boolean;
  isOpen: boolean;
  onNavigate: () => void;
}>;

export function Sidebar({ isCollapsed, isOpen, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar panel */}
      <aside
        aria-label="Dashboard sidebar"
        className={[
          "fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col",
          "bg-white border-r border-border transition-[width,transform] duration-200",
          "motion-reduce:transition-none",
          "lg:sticky lg:top-0 lg:translate-x-0",
          isCollapsed ? "w-[17rem] lg:w-[4.5rem]" : "w-[17rem]",
          isOpen ? "translate-x-0 shadow-card-md" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo / brand header */}
        <div className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b border-border px-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-brand"
            aria-hidden="true"
          >
            <Icon name="layers" className="h-[1.1rem] w-[1.1rem]" />
          </div>
          <div className={`min-w-0 transition-opacity duration-150 ${isCollapsed ? "lg:opacity-0 lg:pointer-events-none lg:w-0 lg:overflow-hidden" : "opacity-100"}`}>
            <p className="truncate text-sm font-bold tracking-tight text-ink">
              Subscript
            </p>
            <p className="text-[0.7rem] text-ink-muted font-medium">Management workspace</p>
          </div>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto px-3 py-5 space-y-5"
          id="main-navigation"
        >
          {NAVIGATION_GROUPS.map((group) => (
            <section aria-label={group.label} key={group.label}>
              <h2
                className={[
                  "mb-1.5 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint",
                  isCollapsed ? "lg:sr-only" : "",
                ].join(" ")}
              >
                {group.label}
              </h2>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <li key={item.href}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        href={item.href}
                        onClick={onNavigate}
                        title={isCollapsed ? item.label : undefined}
                        className={[
                          "group flex min-h-[2.5rem] items-center gap-3 rounded-xl px-3 text-sm font-medium",
                          "transition-all duration-150",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                          isActive
                            ? "bg-brand-50 text-brand font-semibold"
                            : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                        ].join(" ")}
                      >
                        {/* Active indicator bar */}
                        <span
                          className={[
                            "absolute left-0 h-5 w-0.5 rounded-r-full bg-brand transition-all duration-200",
                            isActive ? "opacity-100" : "opacity-0",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        <Icon
                          aria-hidden
                          name={item.icon}
                          className={[
                            "h-[1.1rem] w-[1.1rem] shrink-0 transition-colors duration-150",
                            isActive
                              ? "text-brand"
                              : "text-ink-faint group-hover:text-ink-muted",
                          ].join(" ")}
                        />
                        <span
                          className={[
                            "truncate transition-all duration-150",
                            isCollapsed ? "lg:hidden" : "",
                          ].join(" ")}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="border-t border-border p-3">
          <Link
            href="/settings"
            onClick={onNavigate}
            title={isCollapsed ? "Account settings" : undefined}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand font-semibold text-xs ring-2 ring-brand/20">
              WS
            </span>
            <span className={`min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
              <span className="block font-semibold text-ink text-[0.8rem] truncate">
                Workspace
              </span>
              <span className="block text-[0.7rem] text-ink-muted">Account settings</span>
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
