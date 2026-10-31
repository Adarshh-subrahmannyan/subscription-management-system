import { Icon } from "@/components/layout/icon";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";

// ── Placeholder KPI data ─────────────────────────────────────────────────────
// These are illustrative mock values. Replace with real API responses once the
// reporting endpoint is available. Do not treat these as live metrics.
const KPI_CARDS = [
  {
    id: "active-subscriptions",
    title: "Active subscriptions",
    value: "—",
    detail: "Awaiting reporting API",
    variant: "brand" as const,
    icon: <Icon name="repeat" className="h-5 w-5" />,
  },
  {
    id: "revenue-received",
    title: "Revenue received",
    value: "—",
    detail: "Payments collected, not merely invoiced",
    variant: "success" as const,
    icon: <Icon name="card" className="h-5 w-5" />,
  },
  {
    id: "outstanding-amount",
    title: "Outstanding amount",
    value: "—",
    detail: "Unpaid invoice balance",
    variant: "warning" as const,
    icon: <Icon name="receipt" className="h-5 w-5" />,
  },
  {
    id: "overdue-invoices",
    title: "Overdue invoices",
    value: "—",
    detail: "Past due date and not fully paid",
    variant: "danger" as const,
    icon: <Icon name="alert" className="h-5 w-5" />,
  },
  {
    id: "total-customers",
    title: "Total customers",
    value: "—",
    detail: "All registered customer accounts",
    variant: "default" as const,
    icon: <Icon name="users" className="h-5 w-5" />,
  },
  {
    id: "total-subscriptions",
    title: "Total subscriptions",
    value: "—",
    detail: "All-time subscription count",
    variant: "default" as const,
    icon: <Icon name="layers" className="h-5 w-5" />,
  },
] as const;

// ── Recent activity placeholder rows ────────────────────────────────────────
const ACTIVITY_ROWS = [
  { label: "Recent invoices",  icon: "receipt" as const, href: "/invoices"      },
  { label: "Recent payments",  icon: "card"    as const, href: "/payments"      },
  { label: "Upcoming renewals",icon: "repeat"  as const, href: "/subscriptions" },
];

export default function DashboardPage() {
  return (
    <section>
      <PageHeader
        title="Dashboard"
        description="Your subscription business at a glance."
        badge="Live"
      />

      {/* KPI grid */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Key performance indicators"
      >
        {KPI_CARDS.map((card) => (
          <StatCard
            key={card.id}
            title={card.title}
            value={card.value}
            detail={card.detail}
            variant={card.variant}
            icon={card.icon}
          />
        ))}
      </div>

      {/* Charts + activity — pending API */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue chart placeholder */}
        <div className="lg:col-span-2 card p-6 min-h-[20rem] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-ink">Revenue over time</h2>
              <p className="text-xs text-ink-muted mt-0.5">Monthly revenue received</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand">
              <Icon name="chart" className="h-4 w-4" />
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-surface-muted border border-border border-dashed">
            <div className="text-center px-6 py-10">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-card text-ink-faint">
                <Icon name="chart" className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink-muted">
                Revenue chart not yet connected
              </p>
              <p className="mt-1 text-xs text-ink-faint max-w-xs">
                Will render once the reporting API is available. No fabricated data is displayed.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription status */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-ink">Status breakdown</h2>
              <p className="text-xs text-ink-muted mt-0.5">Subscription distribution</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand">
              <Icon name="layers" className="h-4 w-4" />
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-2xl bg-surface-muted border border-border border-dashed">
            <div className="text-center px-4 py-8">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-card text-ink-faint">
                <Icon name="repeat" className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink-muted">Awaiting data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity links */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ACTIVITY_ROWS.map(({ label, icon, href }) => (
          <a
            key={label}
            href={href}
            className="card flex items-center gap-4 p-5 hover:shadow-card-md hover:border-brand/30 transition-all duration-200 group"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-200">
              <Icon name={icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">{label}</span>
              <span className="block text-xs text-ink-muted mt-0.5">View all records</span>
            </span>
            <Icon name="chevron" className="h-4 w-4 text-ink-faint ml-auto shrink-0 group-hover:text-brand transition-colors" />
          </a>
        ))}
      </div>
    </section>
  );
}
