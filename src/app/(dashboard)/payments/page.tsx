"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
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

type Payment = {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  reference: string | null;
  note: string | null;
  invoice: {
    id: string;
    number: string;
    total: number;
    status: string;
    customer: { id: string; name: string };
  };
};

const METHOD_LABELS: Record<string, string> = {
  card: "Card",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function PaymentsPage() {
  const { status } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError(null);
    fetch(`/api/payments?page=${page}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load payments.");
        setPayments(payload.data ?? []);
        setTotal(payload.total ?? 0);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load payments.")
      )
      .finally(() => setLoading(false));
  }, [status, page]);

  return (
    <section>
      <PageHeader
        title="Payments"
        description="Track all payment transactions and their linked invoices."
      />

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">Loading payments…</div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments recorded"
          description="Payment transactions will appear here once invoices are paid."
          icon="card"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Invoice", "Customer", "Amount", "Method", "Date", "Reference"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((pay) => (
                  <tr key={pay.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors">
                    <td className="px-5 py-4">
                      <a href={`/invoices/${pay.invoice.id}`} className="font-mono text-xs text-brand hover:underline">
                        {pay.invoice.number}
                      </a>
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink">{pay.invoice.customer.name}</td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">{formatCurrency(pay.amount)}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium">
                        {METHOD_LABELS[pay.method] ?? pay.method}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink-muted tabular">{formatDate(pay.paidAt)}</td>
                    <td className="px-5 py-4 text-ink-muted font-mono text-xs">{pay.reference ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-surface-muted/40">
            <p className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">{payments.length}</span> of <span className="font-semibold text-ink">{total}</span> payments
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-surface-muted">
                <Icon name="chevron" className="h-4 w-4 rotate-180" />
              </button>
              <span className="px-2 text-xs text-ink-muted">Page {page}</span>
              <button type="button" onClick={() => setPage(p => p + 1)} disabled={payments.length < 20}
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
