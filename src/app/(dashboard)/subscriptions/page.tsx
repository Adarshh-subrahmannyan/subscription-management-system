import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

// Placeholder — replace with API data
const MOCK_SUBSCRIPTIONS = [
  {
    id: "sub-001",
    number: "SUB-0001",
    customer: "Acme Corp",
    plan: "Enterprise Suite / Monthly",
    quantity: 5,
    startDate: "Oct 1, 2026",
    nextBilling: "Nov 1, 2026",
    status: "active",
    amount: "₹60,000",
  },
  {
    id: "sub-002",
    number: "SUB-0002",
    customer: "TechStart Ltd",
    plan: "Starter Pack / Monthly",
    quantity: 2,
    startDate: "Oct 15, 2026",
    nextBilling: "Nov 15, 2026",
    status: "active",
    amount: "₹5,000",
  },
  {
    id: "sub-003",
    number: "SUB-0003",
    customer: "GreenLeaf Inc",
    plan: "Starter Pack / Yearly",
    quantity: 1,
    startDate: "Sep 1, 2026",
    nextBilling: "Sep 1, 2027",
    status: "pending",
    amount: "₹2,500",
  },
  {
    id: "sub-004",
    number: "SUB-0004",
    customer: "Horizon Media",
    plan: "Enterprise Suite / Monthly",
    quantity: 10,
    startDate: "Aug 1, 2026",
    nextBilling: "—",
    status: "closed",
    amount: "₹1,20,000",
  },
];

const STATUS_FILTERS = ["All", "Active", "Pending", "Closed", "Draft"] as const;

export default function SubscriptionsPage() {
  return (
    <section>
      <PageHeader
        title="Subscriptions"
        description="Track, manage, and action all customer subscriptions."
        actions={
          <a
            href="/subscriptions/new"
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Icon name="plus" className="h-4 w-4" />
            New subscription
          </a>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input
            type="search"
            placeholder="Search subscriptions…"
            aria-label="Search subscriptions"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
        {/* Quick status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f, i) => (
            <button
              key={f}
              type="button"
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${i === 0 ? "bg-brand text-white shadow-brand" : "border border-border bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {MOCK_SUBSCRIPTIONS.length === 0 ? (
        <EmptyState
          title="No subscriptions yet"
          description="Create your first subscription to get started."
          icon="repeat"
          action={
            <a
              href="/subscriptions/new"
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors"
            >
              <Icon name="plus" className="h-4 w-4" />
              New subscription
            </a>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["#", "Customer", "Plan", "Qty", "Next billing", "Amount", "Status", ""].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBSCRIPTIONS.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">{sub.number}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand text-xs font-bold">
                          {sub.customer.charAt(0)}
                        </span>
                        <a
                          href={`/subscriptions/${sub.id}`}
                          className="font-semibold text-ink hover:text-brand transition-colors"
                        >
                          {sub.customer}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted max-w-[200px] truncate">{sub.plan}</td>
                    <td className="px-5 py-4 tabular text-ink-muted">{sub.quantity}</td>
                    <td className="px-5 py-4 tabular text-ink-muted">{sub.nextBilling}</td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">{sub.amount}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`/subscriptions/${sub.id}`}
                          aria-label={`View ${sub.number}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-surface-muted/40">
            <p className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">4</span> of <span className="font-semibold text-ink">4</span> subscriptions
            </p>
            <div className="flex items-center gap-1">
              <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="chevron" className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="chevron" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
