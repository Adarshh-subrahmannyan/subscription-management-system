import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Payment = {
  id: string;
  method: string;
  amount: number;
  paidAt: string;
  note: string | null;
  invoice: { number: string };
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

export default async function PortalPaymentsPage() {
  const session = await getServerSession(authOptions);
  let customerId = session?.user?.customerId;

  if (!customerId) {
    const firstCust = await prisma.customer.findFirst({ where: { active: true } });
    customerId = firstCust?.id;
  }

  const payments = customerId
    ? await prisma.payment.findMany({
        where: { invoice: { customerId } },
        orderBy: { paidAt: "desc" },
        include: {
          invoice: { select: { number: true, total: true } },
        },
      })
    : [];

  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">Payment History</h1>
      <p className="text-sm text-ink-muted mb-6">A record of all your processed payments and transaction references.</p>

      {payments.length === 0 ? (
        <div className="card overflow-hidden">
          <EmptyState
            title="No payments recorded"
            description="Your payment transactions will be recorded and displayed here once processed."
            icon="card"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-ink-muted">Invoice {p.invoice.number}</p>
                <p className="text-sm font-semibold text-ink capitalize mt-0.5">{p.method.replace("_", " ")}</p>
                <p className="text-xs text-ink-muted mt-1">{formatDate(p.paidAt)}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-green-700 tabular block">
                  {formatCurrency(p.amount)}
                </span>
                {p.reference && (
                  <span className="text-[10px] font-mono text-ink-muted mt-0.5 block truncate max-w-[120px]">
                    {p.reference}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
