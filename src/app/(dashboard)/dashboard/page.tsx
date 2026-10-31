"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/icon";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ErrorState } from "@/components/shared/error-state";
import { CardLoadingState } from "@/components/shared/loading-state";
import { apiRequest, formatCurrency } from "@/lib/client-api";

type Analytics = {
  activeSubscriptionCount: number;
  subscriptionCount: number;
  customerCount: number;
  overdueInvoiceCount: number;
  totalPaid: number;
  outstandingAmount: number;
  subscriptionsByStatus: { status: string; count: number }[];
};

// ── Recent activity placeholder rows ────────────────────────────────────────
const ACTIVITY_ROWS = [
  { label: "Recent invoices",  icon: "receipt" as const, href: "/invoices"      },
  { label: "Recent payments",  icon: "card"    as const, href: "/payments"      },
  { label: "Upcoming renewals",icon: "repeat"  as const, href: "/subscriptions" },
];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Analytics>("/api/analytics")
      .then(setAnalytics)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard analytics."));
  }, []);

  const cards = analytics ? [
    { id: "active-subscriptions", title: "Active subscriptions", value: String(analytics.activeSubscriptionCount), detail: "Currently active", variant: "brand" as const, icon: <Icon name="repeat" className="h-5 w-5" /> },
    { id: "revenue-received", title: "Revenue received", value: formatCurrency(analytics.totalPaid), detail: "Payments collected", variant: "success" as const, icon: <Icon name="card" className="h-5 w-5" /> },
    { id: "outstanding-amount", title: "Outstanding amount", value: formatCurrency(analytics.outstandingAmount), detail: "Unpaid invoice balance", variant: "warning" as const, icon: <Icon name="receipt" className="h-5 w-5" /> },
    { id: "overdue-invoices", title: "Overdue invoices", value: String(analytics.overdueInvoiceCount), detail: "Past due and not fully paid", variant: "danger" as const, icon: <Icon name="alert" className="h-5 w-5" /> },
    { id: "total-customers", title: "Total customers", value: String(analytics.customerCount), detail: "Registered customer accounts", variant: "default" as const, icon: <Icon name="users" className="h-5 w-5" /> },
    { id: "total-subscriptions", title: "Total subscriptions", value: String(analytics.subscriptionCount), detail: "All subscription statuses", variant: "default" as const, icon: <Icon name="layers" className="h-5 w-5" /> },
  ] : [];

  return (
    <section>
      <PageHeader
        title="Dashboard"
        description="Your subscription business at a glance."
        badge={analytics ? "Live" : "Loading"}
      />

      {/* KPI grid */}
      {error ? <ErrorState message={error} onRetry={() => {
        setError(null);
        apiRequest<Analytics>("/api/analytics")
          .then(setAnalytics)
          .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard analytics."));
      }} /> : !analytics ? <CardLoadingState cards={6} /> : <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Key performance indicators"
      >
        {cards.map((card) => (
          <StatCard
            key={card.id}
            title={card.title}
            value={card.value}
            detail={card.detail}
            variant={card.variant}
            icon={card.icon}
          />
        ))}
      </div>}

      {/* Charts + activity — pending API */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue chart placeholder */}
        <div className="lg:col-span-2 card p-6 min-h-[20rem] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-ink">Revenue over time</h2>
              <p className="text-xs text-ink-muted mt-0.5">Monthly revenue received</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand">
              <Icon name="chart" className="h-4 w-4" />
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-surface-muted border border-border border-dashed">
            <div className="text-center px-6 py-10">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-card text-ink-faint">
                <Icon name="chart" className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink-muted">
                Revenue history is not available yet
              </p>
              <p className="mt-1 text-xs text-ink-faint max-w-xs">
                Live totals above come from billing records. No fabricated history is displayed.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription status */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-ink">Status breakdown</h2>
              <p className="text-xs text-ink-muted mt-0.5">Subscription distribution</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand">
              <Icon name="layers" className="h-4 w-4" />
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-surface-muted border border-border border-dashed">
            <div className="text-center px-4 py-8">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-card text-ink-faint">
                <Icon name="repeat" className="h-5 w-5" />
              </span>
              {analytics ? (
                <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                  {analytics.subscriptionsByStatus.map(({ status, count }) => (
                    <li key={status} className="flex justify-between gap-6"><span className="capitalize">{status}</span><strong className="text-ink">{count}</strong></li>
                  ))}
                  {analytics.subscriptionsByStatus.length === 0 && <li>No subscriptions recorded</li>}
                </ul>
              ) : <p className="mt-3 text-sm font-semibold text-ink-muted">{error ? "Analytics unavailable" : "Loading data…"}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity links */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ACTIVITY_ROWS.map(({ label, icon, href }) => (
          <a
            key={label}
            href={href}
            className="card flex items-center gap-4 p-5 hover:shadow-card-md hover:border-brand/30 transition-all duration-200 group"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-200">
              <Icon name={icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{label}</span>
              <span className="block text-xs text-ink-muted mt-0.5">View all records</span>
            </span>
            <Icon name="chevron" className="h-4 w-4 text-ink-faint ml-auto shrink-0 group-hover:text-brand transition-colors" />
          </a>
        ))}
      </div>
    </section>
  );
}
