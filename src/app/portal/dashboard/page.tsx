import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/layout/icon";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function PortalDashboardPage() {
  const session = await getServerSession(authOptions);
  let customerId = session?.user?.customerId;

  if (!customerId) {
    const firstCust = await prisma.customer.findFirst({ where: { active: true } });
    customerId = firstCust?.id;
  }

  const [customer, subscriptions, invoices, featuredPlan] = await Promise.all([
    customerId ? prisma.customer.findUnique({ where: { id: customerId } }) : null,
    customerId
      ? prisma.subscription.findMany({
          where: { customerId },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [],
    customerId
      ? prisma.invoice.findMany({
          where: { customerId },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [],
    prisma.plan.findFirst({ where: { active: true }, orderBy: { price: "desc" } }),
  ]);

  const customerName = customer?.name ?? session?.user?.name ?? "Customer";

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs text-ink-muted font-medium">Customer Portal</p>
        <h1 className="text-xl font-bold text-ink mt-0.5">{customerName}</h1>
      </div>

      {/* Featured Plan Card */}
      {featuredPlan && (
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p className="text-xs text-ink-muted font-medium">Recommended</p>
              <p className="text-base font-bold text-ink leading-tight">Featured Plan</p>
            </div>
            <Link
              href="/portal/subscriptions"
              aria-label="See all subscriptions"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white transition-colors"
            >
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>

          <div className="card flex overflow-hidden">
            <div className="w-[5.5rem] shrink-0 bg-brand flex flex-col items-center justify-center py-5 gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                <span className="text-xs font-bold text-brand">P</span>
              </div>
              <span className="text-[0.6rem] text-white/80 text-center leading-tight px-2">
                Special Rate
              </span>
            </div>
            <div className="flex flex-1 items-center justify-between px-4 py-4 gap-3">
              <div>
                <p className="text-sm font-bold text-ink">{featuredPlan.name}</p>
                <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                  {featuredPlan.description ?? "Complete subscription suite"}
                </p>
                <p className="mt-2 text-lg font-bold text-ink tabular">{formatCurrency(featuredPlan.price)}</p>
                <p className="text-xs text-ink-muted capitalize">Per {featuredPlan.billingFrequency}</p>
              </div>
            </div>
          </div>
        </div>
      )}

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Recent subscriptions</h2>
              <a href="/portal/subscriptions" className="text-xs font-semibold text-brand">View all</a>
            </div>
            {subscriptions.length === 0 ? (
              <div className="card"><EmptyState title="No subscriptions" icon="repeat" /></div>
            ) : <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <article key={subscription.id} className="card flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{subscription.plan.name}</p>
                    <p className="mt-1 text-xs text-ink-muted">Next billing {formatDate(subscription.nextBillingDate)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-ink">{formatCurrency(subscription.plan.price)}</p>
                    <StatusBadge status={subscription.status} />
                  </div>
                </article>
              ))}
            </div>}
          </div>

          <div>
            <p className="text-xs text-ink-muted font-medium">Your</p>
            <p className="text-base font-bold text-ink leading-tight">Active Subscriptions</p>
          </div>
          <Link
            href="/portal/subscriptions"
            aria-label="See all subscriptions"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white transition-colors"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <div className="card p-6 text-center text-sm text-ink-muted">
            You do not have any active subscriptions.
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="card flex items-center gap-4 p-4 hover:shadow-card-md transition-all"
              >
                <div className="h-11 w-11 shrink-0 rounded-2xl bg-brand-50 text-brand flex items-center justify-center text-xs font-bold ring-2 ring-brand/10">
                  <Icon name="repeat" className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{sub.plan.name}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Next billing: <span className="font-medium">{formatDate(sub.nextBillingDate)}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-ink tabular">{formatCurrency(sub.plan.price)}</p>
                  <p className="text-xs text-ink-muted capitalize">/{sub.plan.billingFrequency}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-xs text-ink-muted font-medium">Billing &</p>
            <p className="text-base font-bold text-ink leading-tight">Recent Invoices</p>
          </div>
          <Link
            href="/portal/invoices"
            aria-label="See all invoices"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white transition-colors"
          >
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="card p-6 text-center text-sm text-ink-muted">
            No invoices generated yet.
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="card flex items-center gap-4 p-4 hover:shadow-card-md transition-all"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                    inv.status === "paid" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <Icon name="receipt" className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink font-mono">{inv.number}</p>
                  <p className="text-xs text-ink-muted mt-0.5">Due: {formatDate(inv.dueAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-ink tabular">{formatCurrency(inv.total)}</p>
                  <span
                    className={`text-[0.65rem] font-semibold uppercase tracking-wider ${
                      inv.status === "paid" ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
