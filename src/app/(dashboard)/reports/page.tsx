import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getDetailedReports } from "@/modules/analytics";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const METHOD_LABELS: Record<string, string> = {
  card: "Credit / Debit Card",
  upi: "UPI Transfer",
  bank_transfer: "Direct Bank Transfer",
  cash: "Cash Settlement",
};

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "staff";
  const reports = await getDetailedReports(role);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive business performance, subscription health, and revenue collections."
        badge="Live Metrics"
      />

      {/* Top Level Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Total Invoiced</p>
          <p className="text-2xl font-extrabold text-ink mt-2 tabular">{formatCurrency(reports.totalInvoiced)}</p>
          <p className="text-xs text-ink-muted mt-1">All invoices generated</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-700">Total Collected</p>
          <p className="text-2xl font-extrabold text-green-700 mt-2 tabular">{formatCurrency(reports.totalCollected)}</p>
          <p className="text-xs text-ink-muted mt-1">{reports.collectionRate}% collection efficiency</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Outstanding Balance</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-2 tabular">{formatCurrency(reports.outstandingBalance)}</p>
          <p className="text-xs text-ink-muted mt-1">Pending customer settlement</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Collection Rate</p>
          <p className="text-2xl font-extrabold text-brand mt-2 tabular">{reports.collectionRate}%</p>
          <div className="w-full bg-surface-muted rounded-full h-2 mt-2 overflow-hidden border border-border">
            <div
              className="bg-brand h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, reports.collectionRate)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Status Breakdown */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-ink mb-1">Subscriptions Distribution</h2>
          <p className="text-xs text-ink-muted mb-4">Breakdown across subscription lifecycles</p>
          <div className="space-y-3">
            {reports.subscriptionsByStatus.length === 0 ? (
              <p className="text-sm text-ink-muted">No subscriptions recorded.</p>
            ) : (
              reports.subscriptionsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-border">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="text-sm font-bold text-ink tabular">{item.count} account{item.count !== 1 ? "s" : ""}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card p-6">
          <h2 className="text-base font-bold text-ink mb-1">Collections by Payment Method</h2>
          <p className="text-xs text-ink-muted mb-4">Volume and transaction count per payment gateway</p>
          <div className="space-y-3">
            {reports.paymentsByMethod.length === 0 ? (
              <p className="text-sm text-ink-muted">No payments recorded.</p>
            ) : (
              reports.paymentsByMethod.map((item) => (
                <div key={item.method} className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-border">
                  <div>
                    <p className="text-sm font-semibold text-ink">{METHOD_LABELS[item.method] ?? item.method}</p>
                    <p className="text-xs text-ink-muted">{item.count} transaction{item.count !== 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-sm font-extrabold text-green-700 tabular">{formatCurrency(item.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Customers by Revenue */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-base font-bold text-ink mb-0.5">Top Customers by Revenue</h2>
          <p className="text-xs text-ink-muted">Customers generating the highest cumulative collections</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/60">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Customer</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Subscriptions</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">Total Collections</th>
              </tr>
            </thead>
            <tbody>
              {reports.topCustomers.map((cust) => (
                <tr key={cust.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                  <td className="px-6 py-4">
                    <Link href={`/customers/${cust.id}`} className="font-semibold text-ink hover:text-brand">
                      {cust.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-ink-muted tabular">{cust.subscriptionCount} active</td>
                  <td className="px-6 py-4 text-right font-extrabold text-ink tabular">{formatCurrency(cust.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
