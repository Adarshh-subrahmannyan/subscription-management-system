import { Icon } from "@/components/layout/icon";

// ── Placeholder data – replace with API responses ────────────────────────────
const MOCK_SUBSCRIPTIONS = [
  {
    id: "sub-1",
    serviceName: "YouTube Music",
    logoInitials: "YM",
    logoBg: "bg-red-500",
    plan: "Family Plan",
    amount: "$13.99",
    interval: "/month",
    status: "active",
    nextBilling: "Nov 12, 2026",
  },
  {
    id: "sub-2",
    serviceName: "HBO Max",
    logoInitials: "HBO",
    logoBg: "bg-blue-600",
    plan: "Standard",
    amount: "$15.99",
    interval: "/month",
    status: "active",
    nextBilling: "Nov 18, 2026",
  },
];

const MOCK_INVOICES = [
  { id: "inv-001", label: "INV-0041", amount: "$13.99", dueDate: "Nov 5, 2026",  status: "unpaid" },
  { id: "inv-002", label: "INV-0040", amount: "$15.99", dueDate: "Nov 5, 2026",  status: "unpaid" },
  { id: "inv-003", label: "INV-0039", amount: "$13.99", dueDate: "Oct 12, 2026", status: "paid"   },
];

export default function PortalDashboardPage() {
  return (
    <section>
      {/* Greeting header */}
      <div className="mb-6">
        <p className="text-xs text-ink-muted font-medium">Good afternoon,</p>
        <h1 className="text-xl font-bold text-ink mt-0.5">Jane Doe</h1>
      </div>

      {/* Offer of the week – from mobile design spec */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-xs text-ink-muted font-medium">Offer Of</p>
            <p className="text-base font-bold text-ink leading-tight">The Week</p>
          </div>
          <button
            type="button"
            aria-label="See all offers"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white transition-colors"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
          </button>
        </div>

        {/* Offer card */}
        <div className="card flex overflow-hidden">
          {/* Red strip */}
          <div className="w-[5.5rem] shrink-0 bg-brand flex flex-col items-center justify-center py-5 gap-3">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
              <span className="text-xs font-bold text-brand">N</span>
            </div>
            <span className="text-[0.6rem] text-white/80 text-center leading-tight px-2">
              Expires Nov 30
            </span>
          </div>
          {/* Content */}
          <div className="flex flex-1 items-center justify-between px-4 py-4 gap-3">
            <div>
              <p className="text-sm font-bold text-ink">Netflix</p>
              <p className="text-xs text-ink-muted mt-0.5">Family Pack</p>
              <p className="mt-2 text-lg font-bold text-ink tabular">$9.00</p>
              <p className="text-xs text-ink-muted">Per Month</p>
            </div>
            <button
              type="button"
              aria-label="Add Netflix Family Pack subscription"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-brand hover:bg-brand-600 transition-colors"
            >
              <Icon name="plus" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active subscriptions */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-xs text-ink-muted font-medium">Recent</p>
            <p className="text-base font-bold text-ink leading-tight">Subscriptions</p>
          </div>
          <a
            href="/portal/subscriptions"
            aria-label="See all subscriptions"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white transition-colors"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
          </a>
        </div>

        <div className="space-y-3">
          {MOCK_SUBSCRIPTIONS.map((sub) => (
            <a
              key={sub.id}
              href={`/portal/subscriptions`}
              className="card flex items-center gap-4 p-4 hover:shadow-card-md hover:border-brand/20 transition-all group"
            >
              <div className={`h-11 w-11 shrink-0 rounded-2xl ${sub.logoBg} flex items-center justify-center text-white text-xs font-bold`}>
                {sub.logoInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{sub.serviceName}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  Next billing: <span className="font-medium">{sub.nextBilling}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-ink tabular">{sub.amount}</p>
                <p className="text-xs text-ink-muted">{sub.interval}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Unpaid invoices */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-xs text-ink-muted font-medium">Pending</p>
            <p className="text-base font-bold text-ink leading-tight">Invoices</p>
          </div>
          <a
            href="/portal/invoices"
            aria-label="See all invoices"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white transition-colors"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
          </a>
        </div>

        <div className="space-y-2">
          {MOCK_INVOICES.map((inv) => (
            <a
              key={inv.id}
              href="/portal/invoices"
              className="card flex items-center gap-4 p-4 hover:shadow-card-md transition-all"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${inv.status === "paid" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                <Icon name="receipt" className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink">{inv.label}</p>
                <p className="text-xs text-ink-muted mt-0.5">Due: {inv.dueDate}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-ink tabular">{inv.amount}</p>
                <span className={`text-[0.65rem] font-semibold ${inv.status === "paid" ? "text-green-600" : "text-amber-600"}`}>
                  {inv.status === "paid" ? "Paid" : "Unpaid"}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
