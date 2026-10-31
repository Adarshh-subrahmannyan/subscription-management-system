import { EmptyState } from "@/components/shared/empty-state";

export default function PortalInvoicesPage() {
  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">My Invoices</h1>
      <p className="text-sm text-ink-muted mb-6">View and download your invoice history.</p>
      <div className="card overflow-hidden">
        <EmptyState
          title="No invoices yet"
          description="Your invoices will appear here once your subscription is active."
          icon="receipt"
        />
      </div>
    </section>
  );
}
