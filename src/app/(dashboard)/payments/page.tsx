"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Payment = {
  id: string;
  method: string;
  amount: number;
  paidAt: string;
  note: string | null;
  invoice: { number: string; status: string };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Payment[]>("/api/payments")
      .then(setPayments)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load payments."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageHeader
        title="Payments"
        description="Track all payment transactions and their linked invoices."
      />
      {loading ? <LoadingState columns={5} /> : error ? (
        <ErrorState message={error} onRetry={() => {
          setLoading(true);
          setError(null);
          apiRequest<Payment[]>("/api/payments")
            .then(setPayments)
            .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load payments."))
            .finally(() => setLoading(false));
        }} />
      ) : payments.length === 0 ? (
        <EmptyState title="No payments" description="Payments will appear here when recorded." icon="card" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-border bg-surface-muted/60">
                {["Invoice", "Method", "Date", "Amount", "Payment state"].map((heading) => (
                  <th key={heading} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">{heading}</th>
                ))}
              </tr></thead>
              <tbody>{payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-mono text-xs text-ink-muted">{payment.invoice.number}</td>
                  <td className="px-5 py-4 text-ink-muted">{payment.method.replaceAll("_", " ")}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(payment.paidAt)}</td>
                  <td className="px-5 py-4 font-semibold text-ink">{formatCurrency(payment.amount)}</td>
                  <td className="px-5 py-4"><StatusBadge status={payment.note === "Payment failed" ? "failed" : payment.note === "Payment created; awaiting confirmation" ? "pending" : payment.invoice.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
