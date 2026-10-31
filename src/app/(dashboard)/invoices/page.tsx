"use client";

import { useEffect, useMemo, useState } from "react";
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
  createdAt: string;
  dueAt: string | null;
  total: number;
  customer: { name: string };
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Invoice[]>("/api/invoices")
      .then(setInvoices)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load invoices."))
      .finally(() => setLoading(false));
  }, []);

  const filteredInvoices = useMemo(
    () => invoices.filter((invoice) => `${invoice.number} ${invoice.customer.name}`.toLowerCase().includes(search.toLowerCase())),
    [invoices, search],
  );

  return (
    <section>
      <PageHeader
        title="Invoices"
        description="Track all invoices, payment status, and outstanding balances."
      />

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input type="search" placeholder="Search invoices…" aria-label="Search invoices" value={search} onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
      </div>

      {loading ? <LoadingState columns={6} /> : error ? (
        <ErrorState message={error} onRetry={() => {
          setLoading(true);
          setError(null);
          apiRequest<Invoice[]>("/api/invoices")
            .then(setInvoices)
            .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load invoices."))
            .finally(() => setLoading(false));
        }} />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState title="No invoices" description={search ? "No invoices match your search." : "Invoices will appear here once subscriptions are active."} icon="receipt" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Invoice", "Customer", "Date", "Due date", "Total", "Status", ""].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">{inv.number}</td>
                    <td className="px-5 py-4">
                      <a href={`/invoices/${inv.id}`} className="font-semibold text-ink hover:text-brand transition-colors">{inv.customer.name}</a>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(inv.createdAt)}</td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(inv.dueAt)}</td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/invoices/${inv.id}`} aria-label={`View ${inv.number}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
                          <Icon name="eye" className="h-4 w-4" />
                        </a>
                        <button type="button" aria-label={`Download ${inv.number}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
                          <Icon name="download" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
