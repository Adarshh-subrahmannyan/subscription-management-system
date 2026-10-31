"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

type Subscription = {
  id: string;
  number: string;
  status: string;
  startDate: string;
  nextBillingDate: string | null;
  createdAt: string;
  customer: { id: string; name: string };
  plan: { id: string; name: string; billingFrequency: string; price: number };
  lines: Array<{ quantity: number; amount: number }>;
};

const STATUS_FILTERS = ["All", "Active", "Draft", "Quotation", "Paused", "Closed"] as const;

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function SubscriptionsPage() {
  const { status } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadSubscriptions = useCallback((p: number) => {
    setLoading(true);
    setError(null);
    fetch(`/api/subscriptions?page=${p}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load subscriptions.");
        const data = Array.isArray(payload) ? payload : payload.data ?? payload;
        setSubscriptions(data);
        setTotal(payload.total ?? data.length);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load subscriptions.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadSubscriptions(page);
  }, [status, page, loadSubscriptions]);

  const filtered = subscriptions.filter((s) => {
    const matchesStatus = statusFilter === "All" || s.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !search || s.customer.name.toLowerCase().includes(search.toLowerCase()) || s.number.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
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

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">Loading subscriptions…</div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No subscriptions found"
          description={search || statusFilter !== "All" ? "Try adjusting your filters." : "Create your first subscription to get started."}
          icon="repeat"
          action={
            !search && statusFilter === "All" ? (
              <a href="/subscriptions/new" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors">
                <Icon name="plus" className="h-4 w-4" /> New subscription
              </a>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["#", "Customer", "Plan", "Start date", "Next billing", "Status", ""].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">{sub.number}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand text-xs font-bold">
                          {sub.customer.name.charAt(0).toUpperCase()}
                        </span>
                        <a href={`/subscriptions/${sub.id}`} className="font-semibold text-ink hover:text-brand transition-colors">
                          {sub.customer.name}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted max-w-[180px] truncate">
                      {sub.plan.name} / {sub.plan.billingFrequency}
                    </td>
                    <td className="px-5 py-4 text-ink-muted tabular">{formatDate(sub.startDate)}</td>
                    <td className="px-5 py-4 text-ink-muted tabular">{formatDate(sub.nextBillingDate)}</td>
                    <td className="px-5 py-4"><StatusBadge status={sub.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/subscriptions/${sub.id}`} aria-label={`View ${sub.number}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
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
              Showing <span className="font-semibold text-ink">{filtered.length}</span> of <span className="font-semibold text-ink">{total}</span> subscriptions
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-surface-muted">
                <Icon name="chevron" className="h-4 w-4 rotate-180" />
              </button>
              <span className="px-2 text-xs text-ink-muted">Page {page}</span>
              <button type="button" onClick={() => setPage(p => p + 1)} disabled={filtered.length < 20}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-surface-muted">
                <Icon name="chevron" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
