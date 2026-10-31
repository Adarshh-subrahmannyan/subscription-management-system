"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getCurrentNavigation } from "./navigation";
import { Icon } from "./icon";

type NavbarProps = Readonly<{
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  onToggleCollapse: () => void;
  onToggleMobileMenu: () => void;
}>;

export function Navbar({
  isSidebarCollapsed,
  isMobileMenuOpen,
  onToggleCollapse,
  onToggleMobileMenu,
}: NavbarProps) {
  const pathname = usePathname();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const currentNavigation = getCurrentNavigation(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isAccountMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isAccountMenuOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-[4.5rem] items-center justify-between border-b border-border bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-6">
      {/* Left: sidebar toggle + breadcrumb */}
      <div className="flex min-w-0 items-center gap-2">
        {/* Mobile menu toggle */}
        <button
          aria-controls="main-navigation"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand lg:hidden"
          onClick={onToggleMobileMenu}
          type="button"
        >
          <Icon className="h-5 w-5" name={isMobileMenuOpen ? "close" : "menu"} />
        </button>

        {/* Desktop collapse toggle */}
        <button
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand lg:flex"
          onClick={onToggleCollapse}
          type="button"
        >
          <Icon className="h-5 w-5" name="panel" />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="min-w-0 ml-1">
          <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            <li className="hidden shrink-0 text-ink-faint text-xs sm:block">
              Workspace
            </li>
            {currentNavigation && (
              <>
                <li aria-hidden="true" className="hidden text-ink-faint text-xs sm:block">
                  /
                </li>
                <li className="hidden shrink-0 text-ink-muted text-xs md:block">
                  {currentNavigation.group.label}
                </li>
                <li aria-hidden="true" className="hidden text-ink-faint text-xs md:block">
                  /
                </li>
                <li
                  aria-current="page"
                  className="truncate text-sm font-semibold text-ink"
                >
                  {currentNavigation.item.label}
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>

      {/* Right: notifications + account */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell */}
        <button
          aria-label="View notifications"
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Icon name="bell" className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-white" aria-hidden="true" />
        </button>

        {/* Account menu */}
        <div className="relative" ref={menuRef}>
          <button
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="menu"
            aria-label="Open account menu"
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 text-left hover:bg-surface-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => setIsAccountMenuOpen((open) => !open)}
            type="button"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand text-xs font-bold ring-2 ring-brand/20">
              WS
            </span>
            <span className="hidden text-sm font-semibold text-ink sm:block">
              Workspace
            </span>
            <Icon
              className={`hidden h-4 w-4 text-ink-faint sm:block transition-transform duration-150 ${isAccountMenuOpen ? "rotate-90" : ""}`}
              name="chevron"
            />
          </button>

          {isAccountMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-white p-1.5 shadow-card-md animate-scale-in"
              id="account-menu"
              role="menu"
            >
              <div className="px-3 py-2.5 border-b border-border mb-1">
                <p className="text-xs font-semibold text-ink">Workspace</p>
                <p className="text-[0.7rem] text-ink-muted mt-0.5">admin@workspace.com</p>
              </div>
              <Link
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-surface-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                href="/settings"
                onClick={() => setIsAccountMenuOpen(false)}
                role="menuitem"
              >
                <Icon className="h-4 w-4 text-ink-muted" name="settings" />
                Account settings
              </Link>
              <button
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-brand hover:bg-brand-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                role="menuitem"
                type="button"
              >
                <Icon className="h-4 w-4" name="logout" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
