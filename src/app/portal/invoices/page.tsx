import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

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

export default async function PortalInvoicesPage() {
  const session = await getServerSession(authOptions);
  let customerId = session?.user?.customerId;

  if (!customerId) {
    const firstCust = await prisma.customer.findFirst({ where: { active: true } });
    customerId = firstCust?.id;
  }

  const invoices = customerId
    ? await prisma.invoice.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        include: {
          subscription: { include: { plan: true } },
          payments: true,
        },
      })
    : [];

  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">My Invoices</h1>
      <p className="text-sm text-ink-muted mb-6">View your billing statements, payment status, and balance due.</p>

      {invoices.length === 0 ? (
        <div className="card overflow-hidden">
          <EmptyState
            title="No invoices yet"
            description="Your invoices will appear here once your subscription generates billing statements."
            icon="receipt"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs text-ink-muted">{inv.number}</span>
                  <p className="text-sm font-bold text-ink mt-0.5">
                    {inv.subscription ? inv.subscription.plan.name : `Period ${inv.billingPeriod}`}
                  </p>
                </div>
                <StatusBadge status={inv.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-border text-xs">
                <div>
                  <span className="text-ink-muted block">Issued</span>
                  <span className="font-medium text-ink mt-0.5 block">{formatDate(inv.issuedAt)}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Due date</span>
                  <span className="font-medium text-ink mt-0.5 block">{formatDate(inv.dueAt)}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Total amount</span>
                  <span className="font-bold text-ink mt-0.5 block tabular">{formatCurrency(inv.total)}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Paid amount</span>
                  <span className="font-bold text-green-700 mt-0.5 block tabular">{formatCurrency(inv.paidAmount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
