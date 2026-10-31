"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/layout/icon";

type SubscriptionLine = {
  id: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  amount: number;
  product: { id: string; name: string; type: string };
};

type SubscriptionDetail = {
  id: string;
  number: string;
  status: string;
  startDate: string;
  expiryDate: string | null;
  nextBillingDate: string | null;
  pausedAt: string | null;
  closedAt: string | null;
  paymentTerms: string | null;
  createdAt: string;
  customer: { id: string; name: string; email: string; phone: string | null };
  plan: { id: string; name: string; billingFrequency: string; price: number };
  lines: SubscriptionLine[];
  invoices: Array<{ id: string; number: string; status: string; total: number; paidAmount: number; issuedAt: string | null; dueAt: string | null }>;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const FREQ_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Annually",
  weekly: "Weekly",
};

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { status } = useSession();
  const [sub, setSub] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/subscriptions/${id}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load subscription.");
        setSub(payload.data ?? payload);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load subscription."))
      .finally(() => setLoading(false));
  }, [id, status]);

  if (loading) {
    return (
      <section>
        <PageHeader title="Subscription" description="Loading…" />
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">Loading subscription details…</div>
      </section>
    );
  }

  if (error || !sub) {
    return (
      <section>
        <PageHeader title="Subscription" description="Not found" />
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error ?? "Subscription not found."}</p>
      </section>
    );
  }

  const totalAmount = sub.lines.reduce((s, l) => s + l.amount, 0);

  return (
    <section>
      <PageHeader
        title={sub.number}
        description={`${sub.customer.name} — ${sub.plan.name}`}
        badge={sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: details */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Summary card */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold text-ink">Subscription details</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Status</dt>
                <dd><StatusBadge status={sub.status} /></dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Plan</dt>
                <dd className="font-semibold text-ink">{sub.plan.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Billing frequency</dt>
                <dd className="text-ink">{FREQ_LABELS[sub.plan.billingFrequency] ?? sub.plan.billingFrequency}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Payment terms</dt>
                <dd className="text-ink">{sub.paymentTerms ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Start date</dt>
                <dd className="text-ink">{formatDate(sub.startDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Next billing</dt>
                <dd className="text-ink">{formatDate(sub.nextBillingDate)}</dd>
              </div>
              {sub.closedAt && (
                <div>
                  <dt className="text-xs text-ink-muted mb-0.5">Closed at</dt>
                  <dd className="text-ink">{formatDate(sub.closedAt)}</dd>
                </div>
              )}
              {sub.pausedAt && (
                <div>
                  <dt className="text-xs text-ink-muted mb-0.5">Paused at</dt>
                  <dd className="text-ink">{formatDate(sub.pausedAt)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Lines */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-sm font-bold text-ink">Line items</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Product", "Qty", "Unit price", "Tax", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sub.lines.map((line) => (
                  <tr key={line.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium text-ink">{line.product.name}</td>
                    <td className="px-5 py-3.5 text-ink-muted tabular">{line.quantity}</td>
                    <td className="px-5 py-3.5 tabular">{formatCurrency(line.unitPrice)}</td>
                    <td className="px-5 py-3.5 text-ink-muted tabular">{formatCurrency(line.taxAmount)}</td>
                    <td className="px-5 py-3.5 font-semibold tabular">{formatCurrency(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-muted/40">
                  <td colSpan={4} className="px-5 py-3.5 text-right text-sm font-semibold text-ink">Total per cycle</td>
                  <td className="px-5 py-3.5 font-bold text-ink tabular">{formatCurrency(totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Invoices */}
          {sub.invoices.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="text-sm font-bold text-ink">Invoices</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60">
                    {["Invoice", "Issued", "Due", "Total", "Paid", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sub.invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                      <td className="px-5 py-3">
                        <a href={`/invoices/${inv.id}`} className="font-mono text-xs text-brand hover:underline">{inv.number}</a>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">{formatDate(inv.issuedAt)}</td>
                      <td className="px-5 py-3 text-ink-muted">{formatDate(inv.dueAt)}</td>
                      <td className="px-5 py-3 font-semibold tabular">{formatCurrency(inv.total)}</td>
                      <td className="px-5 py-3 text-ink-muted tabular">{formatCurrency(inv.paidAmount)}</td>
                      <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: customer + quick actions */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold text-ink">Customer</h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand font-bold text-sm ring-2 ring-brand/10">
                {sub.customer.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <a href={`/customers/${sub.customer.id}`} className="font-semibold text-ink hover:text-brand transition-colors block">
                  {sub.customer.name}
                </a>
                <span className="text-xs text-ink-muted">{sub.customer.email}</span>
              </div>
            </div>
            {sub.customer.phone && (
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <Icon name="user" className="h-3.5 w-3.5" />
                {sub.customer.phone}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold text-ink">Summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Plan price</dt>
                <dd className="font-semibold">{formatCurrency(sub.plan.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Line total</dt>
                <dd className="font-semibold">{formatCurrency(totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Total invoiced</dt>
                <dd className="font-semibold">{formatCurrency(sub.invoices.reduce((s, i) => s + i.total, 0))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Total paid</dt>
                <dd className="font-semibold text-green-600">{formatCurrency(sub.invoices.reduce((s, i) => s + i.paidAmount, 0))}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
