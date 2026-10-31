import { BottomNavigation } from "@/components/mobile/bottom-navigation";

export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-surface-muted">
      {/* Top portal header */}
      <header className="sticky top-0 z-20 bg-white border-b border-border px-4 sm:px-6">
        <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white shadow-brand">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24">
                <path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
              </svg>
            </div>
            <span className="text-sm font-bold text-ink">Subscript</span>
          </div>
          {/* Desktop navigation */}
          <nav aria-label="Portal navigation" className="hidden lg:flex items-center gap-1">
            {[
              { href: "/portal/dashboard",     label: "Home"       },
              { href: "/portal/subscriptions", label: "My Plans"   },
              { href: "/portal/invoices",      label: "Invoices"   },
              { href: "/portal/payments",      label: "Payments"   },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand text-xs font-bold ring-2 ring-brand/20">
            JD
          </div>
        </div>
      </header>

      {/* Main content */}
      <main
        id="portal-main"
        className="mx-auto max-w-2xl px-4 py-6 sm:px-6 pb-24 lg:pb-8"
      >
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <BottomNavigation />
    </div>
  );
}
