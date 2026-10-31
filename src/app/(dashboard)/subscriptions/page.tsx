"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Subscription = {
  id: string;
  number: string;
  status: string;
  nextBillingDate: string | null;
  customer: { name: string };
  plan: { name: string; price: number; billingFrequency: string };
  lines: { quantity: number }[];
};

const STATUS_FILTERS = ["All", "Active", "Pending", "Closed", "Draft"] as const;

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Subscription[]>("/api/subscriptions?page=1")
      .then(setSubscriptions)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load subscriptions."))
      .finally(() => setLoading(false));
  }, []);

  const filteredSubscriptions = useMemo(() => subscriptions.filter((sub) => {
    const matchesSearch = `${sub.number} ${sub.customer.name} ${sub.plan.name}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || sub.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [subscriptions, search, statusFilter]);

  return (
    <section>
      <PageHeader
        title="Subscriptions"
        description="Track, manage, and action all customer subscriptions."
        actions={
          <a
            href="/subscriptions/new"
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Icon name="plus" className="h-4 w-4" />
            New subscription
          </a>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input
            type="search"
            placeholder="Search subscriptions…"
            aria-label="Search subscriptions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
        {/* Quick status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${statusFilter === f ? "bg-brand text-white shadow-brand" : "border border-border bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingState columns={7} /> : error ? (
        <ErrorState message={error} onRetry={() => {
          setLoading(true);
          setError(null);
          apiRequest<Subscription[]>("/api/subscriptions?page=1")
            .then(setSubscriptions)
            .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load subscriptions."))
            .finally(() => setLoading(false));
        }} />
      ) : filteredSubscriptions.length === 0 ? (
        <EmptyState
          title={subscriptions.length ? "No matching subscriptions" : "No subscriptions yet"}
          description={subscriptions.length ? "Adjust your search or status filter." : "Create your first subscription to get started."}
          icon="repeat"
          action={
            <a
              href="/subscriptions/new"
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors"
            >
              <Icon name="plus" className="h-4 w-4" />
              New subscription
            </a>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["#", "Customer", "Plan", "Qty", "Next billing", "Amount", "Status", ""].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">{sub.number}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand text-xs font-bold">
                          {sub.customer.name.charAt(0)}
                        </span>
                        <a
                          href={`/subscriptions/${sub.id}`}
                          className="font-semibold text-ink hover:text-brand transition-colors"
                        >
                          {sub.customer.name}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted max-w-[200px] truncate">{sub.plan.name} / {sub.plan.billingFrequency}</td>
                    <td className="px-5 py-4 tabular text-ink-muted">{sub.lines.reduce((sum, line) => sum + line.quantity, 0)}</td>
                    <td className="px-5 py-4 tabular text-ink-muted">{formatDate(sub.nextBillingDate)}</td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">{formatCurrency(sub.plan.price)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`/subscriptions/${sub.id}`}
                          aria-label={`View ${sub.number}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-surface-muted/40">
            <p className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">{filteredSubscriptions.length}</span> of <span className="font-semibold text-ink">{subscriptions.length}</span> subscriptions
            </p>
            <div className="flex items-center gap-1">
              <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="chevron" className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="chevron" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
