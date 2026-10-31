"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Invoice = {
  id: string;
  number: string;
  status: string;
  total: number;
  dueAt: string | null;
  createdAt: string;
};

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Invoice[]>("/api/invoices")
      .then(setInvoices)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load invoices."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">My Invoices</h1>
      <p className="text-sm text-ink-muted mb-6">View and download your invoice history.</p>
      {loading ? <LoadingState columns={4} /> : error ? (
        <ErrorState message={error} />
      ) : invoices.length === 0 ? (
        <div className="card overflow-hidden">
          <EmptyState title="No invoices yet" description="Your invoices will appear here once your subscription is active." icon="receipt" />
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <article key={invoice.id} className="card flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-ink">{invoice.number}</p>
                <p className="mt-1 text-xs text-ink-muted">Issued {formatDate(invoice.createdAt)} · Due {formatDate(invoice.dueAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-ink">{formatCurrency(invoice.total)}</p>
                <div className="mt-2"><StatusBadge status={invoice.status} /></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
