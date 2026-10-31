"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Payment = {
  id: string;
  method: string;
  amount: number;
  paidAt: string;
  note: string | null;
  invoice: { number: string };
};

export default function PortalPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Payment[]>("/api/payments")
      .then(setPayments)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load payment history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">Payment History</h1>
      <p className="text-sm text-ink-muted mb-6">A record of all your payments and linked invoices.</p>
      {loading ? <LoadingState columns={4} /> : error ? (
        <ErrorState message={error} />
      ) : payments.length === 0 ? (
        <div className="card overflow-hidden">
          <EmptyState title="No payments yet" description="Your payment history will appear here once you make a payment." icon="card" />
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <article key={payment.id} className="card flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-ink">{payment.invoice.number}</p>
                <p className="mt-1 text-xs text-ink-muted">{payment.method.replaceAll("_", " ")} · {formatDate(payment.paidAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-ink">{formatCurrency(payment.amount)}</p>
                {payment.note && <p className="mt-1 text-xs text-ink-muted">{payment.note}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
