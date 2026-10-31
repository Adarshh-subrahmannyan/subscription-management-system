"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Invoice = {
  id: string;
  number: string;
  status: string;
  issuedAt: string | null;
  dueAt: string | null;
  total: number;
  paidAmount: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  billingPeriod: string;
  customer: { id: string; name: string; email: string };
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function InvoicesPage() {
  const { status } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadInvoices = useCallback((p: number, q: string) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set("search", q);
    fetch(`/api/invoices?${params}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load invoices.");
        setInvoices(payload.data ?? []);
        setTotal(payload.total ?? 0);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load invoices.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadInvoices(page, search);
  }, [status, page, loadInvoices]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const timer = setTimeout(() => { setPage(1); loadInvoices(1, search); }, 300);
    return () => clearTimeout(timer);
  }, [search, status, loadInvoices]);

  return (
    <section>
      <PageHeader
        title="Invoices"
        description="Track all invoices, payment status, and outstanding balances."
      />

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input type="search" placeholder="Search invoices…" aria-label="Search invoices"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">Loading invoices…</div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : invoices.length === 0 ? (
        <EmptyState title="No invoices" description={search ? "Try a different search term." : "Invoices will appear here once subscriptions are active."} icon="receipt" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Invoice", "Customer", "Issued", "Due date", "Total", "Paid", "Status", ""].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">{inv.number}</td>
                    <td className="px-5 py-4">
                      <a href={`/invoices/${inv.id}`} className="font-semibold text-ink hover:text-brand transition-colors">
                        {inv.customer.name}
                      </a>
                      <div className="text-xs text-ink-muted mt-0.5">{inv.customer.email}</div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(inv.issuedAt)}</td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(inv.dueAt)}</td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-4 text-ink-muted tabular">{formatCurrency(inv.paidAmount)}</td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/invoices/${inv.id}`} aria-label={`View ${inv.number}`}
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
              Showing <span className="font-semibold text-ink">{invoices.length}</span> of <span className="font-semibold text-ink">{total}</span> invoices
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-surface-muted">
                <Icon name="chevron" className="h-4 w-4 rotate-180" />
              </button>
              <span className="px-2 text-xs text-ink-muted">Page {page}</span>
              <button type="button" onClick={() => setPage(p => p + 1)} disabled={invoices.length < 20}
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
