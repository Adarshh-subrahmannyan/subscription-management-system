"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CardLoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { apiRequest, formatCurrency } from "@/lib/client-api";

type Analytics = {
  invoiceCount: number;
  overdueInvoiceCount: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingAmount: number;
  totalTax: number;
  totalDiscount: number;
  paymentCount: number;
  totalPaymentsRecorded: number;
  invoicesByStatus: { status: string; count: number }[];
};

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Analytics>("/api/analytics")
      .then(setAnalytics)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load reports."));
  }, []);

  return (
    <section>
      <PageHeader title="Reports" description="Financial reports including revenue, outstanding invoices, and subscription analytics." />
      {error ? <ErrorState message={error} onRetry={() => {
        setError(null);
        apiRequest<Analytics>("/api/analytics")
          .then(setAnalytics)
          .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load reports."));
      }} /> : !analytics ? <CardLoadingState cards={4} /> : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total invoiced", value: formatCurrency(analytics.totalInvoiced) },
              { label: "Revenue received", value: formatCurrency(analytics.totalPaid) },
              { label: "Outstanding", value: formatCurrency(analytics.outstandingAmount) },
              { label: "Overdue invoices", value: String(analytics.overdueInvoiceCount) },
              { label: "Invoice count", value: String(analytics.invoiceCount) },
              { label: "Payments recorded", value: String(analytics.paymentCount) },
              { label: "Tax collected", value: formatCurrency(analytics.totalTax) },
              { label: "Discounts applied", value: formatCurrency(analytics.totalDiscount) },
            ].map(({ label, value }) => (
              <article key={label} className="card p-5">
                <p className="text-sm text-ink-muted">{label}</p>
                <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 card p-6">
            <h2 className="text-base font-bold text-ink">Invoice status</h2>
            {analytics.invoicesByStatus.length === 0 ? (
              <EmptyState title="No invoice data" description="Invoice counts will appear here as records are created." icon="receipt" />
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {analytics.invoicesByStatus.map(({ status, count }) => (
                  <li key={status} className="flex items-center justify-between py-3">
                    <StatusBadge status={status} />
                    <span className="text-sm font-semibold text-ink">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
