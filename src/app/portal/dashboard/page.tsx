"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Subscription = {
  id: string;
  number: string;
  status: string;
  nextBillingDate: string | null;
  plan: { name: string; price: number };
};
type Invoice = {
  id: string;
  number: string;
  status: string;
  total: number;
  dueAt: string | null;
};

export default function PortalDashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiRequest<Subscription[]>("/api/subscriptions?page=1"),
      apiRequest<Invoice[]>("/api/invoices"),
    ])
      .then(([subscriptionData, invoiceData]) => {
        setSubscriptions(subscriptionData.slice(0, 3));
        setInvoices(invoiceData.slice(0, 3));
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load your account summary."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs text-ink-muted font-medium">Welcome back</p>
        <h1 className="text-xl font-bold text-ink mt-0.5">Your account</h1>
      </div>

      {loading ? <LoadingState columns={3} /> : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="card p-4">
              <p className="text-xs text-ink-muted">Subscriptions</p>
              <p className="mt-1 text-2xl font-bold text-ink">{subscriptions.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-ink-muted">Invoices</p>
              <p className="mt-1 text-2xl font-bold text-ink">{invoices.length}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Recent subscriptions</h2>
              <a href="/portal/subscriptions" className="text-xs font-semibold text-brand">View all</a>
            </div>
            {subscriptions.length === 0 ? (
              <div className="card"><EmptyState title="No subscriptions" icon="repeat" /></div>
            ) : <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <article key={subscription.id} className="card flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{subscription.plan.name}</p>
                    <p className="mt-1 text-xs text-ink-muted">Next billing {formatDate(subscription.nextBillingDate)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-ink">{formatCurrency(subscription.plan.price)}</p>
                    <StatusBadge status={subscription.status} />
                  </div>
                </article>
              ))}
            </div>}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Recent invoices</h2>
              <a href="/portal/invoices" className="text-xs font-semibold text-brand">View all</a>
            </div>
            {invoices.length === 0 ? (
              <div className="card"><EmptyState title="No invoices" icon="receipt" /></div>
            ) : <div className="space-y-2">
              {invoices.map((invoice) => (
                <article key={invoice.id} className="card flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{invoice.number}</p>
                    <p className="mt-1 text-xs text-ink-muted">Due {formatDate(invoice.dueAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-ink">{formatCurrency(invoice.total)}</p>
                    <StatusBadge status={invoice.status} />
                  </div>
                </article>
              ))}
            </div>}
          </div>
        </>
      )}
    </section>
  );
}
