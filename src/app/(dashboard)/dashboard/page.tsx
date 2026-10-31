import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/modules/analytics";
import { Icon } from "@/components/layout/icon";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? "staff";
  const stats = await getDashboardStats(role);

  const KPI_CARDS = [
    {
      id: "active-subscriptions",
      title: "Active subscriptions",
      value: stats.activeSubscriptions.toString(),
      detail: "Currently active",
      variant: "brand" as const,
      icon: <Icon name="repeat" className="h-5 w-5" />,
    },
    {
      id: "revenue-received",
      title: "Revenue received",
      value: formatCurrency(stats.revenueReceived),
      detail: "Payments collected",
      variant: "success" as const,
      icon: <Icon name="card" className="h-5 w-5" />,
    },
    {
      id: "outstanding-amount",
      title: "Outstanding amount",
      value: formatCurrency(stats.outstandingAmount),
      detail: "Unpaid invoice balance",
      variant: "warning" as const,
      icon: <Icon name="receipt" className="h-5 w-5" />,
    },
    {
      id: "overdue-invoices",
      title: "Overdue invoices",
      value: stats.overdueInvoices.toString(),
      detail: "Past due date",
      variant: "danger" as const,
      icon: <Icon name="alert" className="h-5 w-5" />,
    },
    {
      id: "total-customers",
      title: "Total customers",
      value: stats.totalCustomers.toString(),
      detail: "Active accounts",
      variant: "default" as const,
      icon: <Icon name="users" className="h-5 w-5" />,
    },
    {
      id: "total-subscriptions",
      title: "Total subscriptions",
      value: stats.totalSubscriptions.toString(),
      detail: "All-time count",
      variant: "default" as const,
      icon: <Icon name="layers" className="h-5 w-5" />,
    },
  ] as const;

  const ACTIVITY_ROWS = [
    { label: "Recent invoices",   icon: "receipt" as const, href: "/invoices"      },
    { label: "Recent payments",   icon: "card"    as const, href: "/payments"      },
    { label: "Upcoming renewals", icon: "repeat"  as const, href: "/subscriptions" },
  ];

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

      {/* Recent activity links */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
