"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

type Quotation = {
  id: string;
  number: string;
  status: string;
  validUntil: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  createdAt: string;
  customer: { id: string; name: string; email: string };
  plan: { id: string; name: string } | null;
  lines: Array<{ id: string; quantity: number; amount: number }>;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_FILTERS = ["All", "Draft", "Sent", "Accepted", "Rejected", "Expired"] as const;

export default function QuotationsPage() {
  const { data: session, status } = useSession();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const canManage = session?.user?.role === "admin" || session?.user?.role === "staff";

  const load = useCallback((p: number) => {
    setLoading(true);
    setError(null);
    fetch(`/api/quotations?page=${p}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load quotations.");
        const data = Array.isArray(payload) ? payload : payload.data ?? payload;
        setQuotations(data);
        setTotal(payload.total ?? data.length);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load quotations.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    load(page);
  }, [status, page, load]);

  const filtered = statusFilter === "All"
    ? quotations
    : quotations.filter((q) => q.status.toLowerCase() === statusFilter.toLowerCase());

  return (
    <section>
      <PageHeader
        title="Quotations"
        description="Create and manage sales quotations before converting to subscriptions."
        actions={
          canManage ? (
            <button type="button" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors">
              <Icon name="plus" className="h-4 w-4" />
              New quotation
            </button>
          ) : undefined
        }
      />

      {/* Status tabs */}
      <div className="mb-4 flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setStatusFilter(f)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${statusFilter === f ? "bg-brand text-white shadow-brand" : "border border-border bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">Loading quotations…</div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No quotations found"
          description={statusFilter !== "All" ? "Try a different status filter." : canManage ? "Create your first quotation to get started." : "No quotations available."}
          icon="file"
          action={canManage && statusFilter === "All" ? (
            <button type="button" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors">
              <Icon name="plus" className="h-4 w-4" /> New quotation
            </button>
          ) : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["#", "Customer", "Plan", "Lines", "Valid until", "Total", "Status"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">{q.number}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink">{q.customer.name}</div>
                      <div className="text-xs text-ink-muted mt-0.5">{q.customer.email}</div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{q.plan?.name ?? "—"}</td>
                    <td className="px-5 py-4 text-ink-muted tabular">{q.lines.length}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      <span className={new Date(q.validUntil) < new Date() && q.status === "draft" ? "text-red-600 font-medium" : ""}>
                        {formatDate(q.validUntil)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">{formatCurrency(q.total)}</td>
                    <td className="px-5 py-4"><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-surface-muted/40">
            <p className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">{filtered.length}</span> of <span className="font-semibold text-ink">{total}</span> quotations
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-surface-muted">
                <Icon name="chevron" className="h-4 w-4 rotate-180" />
              </button>
              <span className="px-2 text-xs text-ink-muted">Page {page}</span>
              <button type="button" onClick={() => setPage(p => p + 1)} disabled={quotations.length < 20}
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
