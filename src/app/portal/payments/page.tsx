import { EmptyState } from "@/components/shared/empty-state";

export default function PortalPaymentsPage() {
  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">Payment History</h1>
      <p className="text-sm text-ink-muted mb-6">A record of all your payments and linked invoices.</p>
      <div className="card overflow-hidden">
        <EmptyState
          title="No payments yet"
          description="Your payment history will appear here once you make a payment."
          icon="card"
        />
      </div>
    </section>
  );
}
