"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/layout/icon";

type Payment = {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  reference: string | null;
  note: string | null;
};

type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  amount: number;
  product?: { name: string };
};

type InvoiceDetail = {
  id: string;
  number: string;
  status: string;
  issuedAt: string | null;
  dueAt: string | null;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paidAmount: number;
  billingPeriod: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };
  subscription?: {
    id: string;
    number: string;
    plan: { name: string; billingFrequency: string };
  } | null;
  lines: InvoiceLine[];
  payments: Payment[];
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment record form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("bank_transfer");
  const [payRef, setPayRef] = useState("");
  const [payNote, setPayNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const canManage = session?.user?.role === "admin" || session?.user?.role === "staff";

  const loadInvoice = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/invoices/${id}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load invoice.");
        const data = payload.data ?? payload;
        setInvoice(data);
        const balance = Math.max(0, data.total - data.paidAmount);
        setPayAmount((balance / 100).toFixed(2));
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load invoice.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadInvoice();
  }, [status, loadInvoice]);

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingPayment(true);
    setPaymentError(null);
    try {
      const amountCents = Math.round(Number(payAmount) * 100);
      if (amountCents <= 0) throw new Error("Amount must be greater than zero.");

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: id,
          amount: amountCents,
          method: payMethod,
          reference: payRef.trim() || undefined,
          note: payNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to record payment.");

      setShowPaymentForm(false);
      setPayRef("");
      setPayNote("");
      loadInvoice();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Error processing payment.");
    } finally {
      setSubmittingPayment(false);
    }
  }

  if (loading) {
    return (
      <section>
        <PageHeader title="Invoice" description="Loading…" />
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">
          Loading invoice details…
        </div>
      </section>
    );
  }

  if (error || !invoice) {
    return (
      <section>
        <PageHeader title="Invoice" description="Not found" />
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error ?? "Invoice not found."}
        </p>
      </section>
    );
  }

  const balanceDue = Math.max(0, invoice.total - invoice.paidAmount);

  return (
    <section className="invoice-detail">
      <PageHeader
        title={invoice.number}
        description={`Issued to ${invoice.customer.name}`}
        badge={invoice.status.toUpperCase()}
        actions={(
          <div className="flex flex-wrap justify-end gap-2 print-hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted transition-colors"
            >
              <Icon name="download" className="h-4 w-4" />
              Print / save PDF
            </button>
            {canManage && balanceDue > 0 && (
              <button
                type="button"
                onClick={() => setShowPaymentForm(true)}
                className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors"
              >
                <Icon name="card" className="h-4 w-4" />
                Record payment
              </button>
            )}
          </div>
        )}
      />

      {/* Record Payment Modal / Section */}
      {showPaymentForm && (
        <div className="mb-6 card p-6 border-brand/30 bg-brand-light/30 print-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink">Record payment for {invoice.number}</h3>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-ink-faint hover:text-ink"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
          {paymentError && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 mb-4">{paymentError}</p>
          )}
          <form onSubmit={handleRecordPayment} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Amount (INR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Transaction reference (optional)
              </label>
              <input
                type="text"
                placeholder={payMethod === "upi" ? "e.g. UPI transaction ID" : "e.g. UTR12345678 or TXN-001"}
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                placeholder="Optional payment notes"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPayment}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 disabled:opacity-60"
              >
                {submittingPayment ? "Recording…" : "Confirm payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold text-ink">Invoice Overview</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Status</dt>
                <dd>
                  <StatusBadge status={invoice.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Issued date</dt>
                <dd className="font-medium text-ink">{formatDate(invoice.issuedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Due date</dt>
                <dd className="font-medium text-ink">{formatDate(invoice.dueAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Billing period</dt>
                <dd className="font-mono text-xs text-ink">{invoice.billingPeriod}</dd>
              </div>
            </dl>
          </div>

          {/* Line Items Table */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-sm font-bold text-ink">Line Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Item
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Qty
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Unit price
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Tax
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={line.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4">
                        <span className="font-medium text-ink">{line.description}</span>
                      </td>
                      <td className="px-5 py-4 text-ink-muted tabular">{line.quantity}</td>
                      <td className="px-5 py-4 text-ink-muted tabular">
                        {formatCurrency(line.unitPrice)}
                      </td>
                      <td className="px-5 py-4 text-ink-muted tabular">
                        {formatCurrency(line.taxAmount)}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-ink tabular">
                        {formatCurrency(line.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments list for this invoice */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">Payment Transactions</h2>
              <span className="text-xs text-ink-muted">
                {invoice.payments.length} payment{invoice.payments.length !== 1 ? "s" : ""}
              </span>
            </div>
            {invoice.payments.length === 0 ? (
              <div className="p-6 text-center text-sm text-ink-muted">
                No payments recorded for this invoice yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Method
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Reference
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 text-ink-muted tabular">
                        {formatDate(p.paidAt)}
                      </td>
                      <td className="px-5 py-3.5 capitalize text-ink">{p.method.replace("_", " ")}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-ink-muted">
                        {p.reference ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-green-700 tabular">
                        {formatCurrency(p.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Customer & Financial Summary */}
        <div className="space-y-6">
          {/* Customer info */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold text-ink">Billed to</h2>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand font-bold text-sm ring-2 ring-brand/10">
                {invoice.customer.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <Link
                  href={`/customers/${invoice.customer.id}`}
                  className="font-semibold text-ink hover:text-brand transition-colors block"
                >
                  {invoice.customer.name}
                </Link>
                <span className="text-xs text-ink-muted">{invoice.customer.email}</span>
              </div>
            </div>
            {invoice.customer.phone && (
              <p className="text-xs text-ink-muted mt-2">
                <span className="font-medium text-ink">Phone:</span> {invoice.customer.phone}
              </p>
            )}
            {invoice.customer.address && (
              <p className="text-xs text-ink-muted mt-1">
                <span className="font-medium text-ink">Address:</span> {invoice.customer.address}
              </p>
            )}
            {invoice.subscription && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-ink-muted">Subscription:</p>
                <Link
                  href={`/subscriptions/${invoice.subscription.id}`}
                  className="text-xs font-semibold text-brand hover:underline mt-0.5 inline-block"
                >
                  {invoice.subscription.number} ({invoice.subscription.plan.name})
                </Link>
              </div>
            )}
          </div>

          {/* Totals Summary */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold text-ink">Invoice Summary</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd className="font-medium tabular">{formatCurrency(invoice.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Tax</dt>
                <dd className="font-medium tabular">{formatCurrency(invoice.taxTotal)}</dd>
              </div>
              {invoice.discountTotal > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>Discount</dt>
                  <dd className="font-medium tabular">
                    -{formatCurrency(invoice.discountTotal)}
                  </dd>
                </div>
              )}
              <div className="border-t border-border pt-2.5 flex justify-between">
                <dt className="font-bold text-ink">Total amount</dt>
                <dd className="font-extrabold text-ink tabular">
                  {formatCurrency(invoice.total)}
                </dd>
              </div>
              <div className="flex justify-between text-green-700">
                <dt className="text-xs">Amount paid</dt>
                <dd className="text-xs font-semibold tabular">
                  {formatCurrency(invoice.paidAmount)}
                </dd>
              </div>
              <div className="border-t border-dashed border-border pt-2.5 flex justify-between">
                <dt className="font-bold text-ink">Balance due</dt>
                <dd
                  className={`font-bold tabular ${
                    balanceDue > 0 ? "text-brand" : "text-green-700"
                  }`}
                >
                  {formatCurrency(balanceDue)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
