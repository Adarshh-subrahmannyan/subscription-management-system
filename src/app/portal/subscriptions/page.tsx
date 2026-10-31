import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Subscription = {
  id: string;
  number: string;
  status: string;
  nextBillingDate: string | null;
  plan: { name: string; price: number; billingFrequency: string };
};

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

export default async function PortalSubscriptionsPage() {
  const session = await getServerSession(authOptions);
  let customerId = session?.user?.customerId;

  if (!customerId) {
    const firstCust = await prisma.customer.findFirst({ where: { active: true } });
    customerId = firstCust?.id;
  }

  const subscriptions = customerId
    ? await prisma.subscription.findMany({
        where: { customerId },
        include: {
          plan: true,
          lines: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">My Subscriptions</h1>
      <p className="text-sm text-ink-muted mb-6">Manage all your active and past subscription plans.</p>

      {subscriptions.length === 0 ? (
        <div className="card overflow-hidden">
          <EmptyState
            title="No subscriptions yet"
            description="Your active subscriptions and plan entitlements will be displayed here."
            icon="repeat"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs text-ink-muted">{sub.number}</span>
                  <h2 className="text-base font-bold text-ink mt-0.5">{sub.plan.name}</h2>
                </div>
                <StatusBadge status={sub.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-border text-xs">
                <div>
                  <span className="text-ink-muted block">Billing cycle</span>
                  <span className="font-semibold text-ink capitalize mt-0.5 block">{sub.plan.billingFrequency}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Next renewal</span>
                  <span className="font-semibold text-ink mt-0.5 block">{formatDate(sub.nextBillingDate)}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Rate</span>
                  <span className="font-bold text-ink mt-0.5 block tabular">{formatCurrency(sub.plan.price)}</span>
                </div>
              </div>

              {sub.lines.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-ink-muted mb-2 uppercase tracking-wider">Features included</p>
                  <ul className="space-y-1.5 text-xs">
                    {sub.lines.map((l) => (
                      <li key={l.id} className="flex justify-between text-ink-muted">
                        <span>{l.product.name}</span>
                        <span className="font-medium text-ink">× {l.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
