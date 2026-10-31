import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function PaymentsPage() {
  return (
    <section>
      <PageHeader
        title="Payments"
        description="Track all payment transactions and their linked invoices."
      />
      <div className="card overflow-hidden">
        <EmptyState
          title="Coming soon"
          description="This page is being built. Data will appear here once the API is connected."
          icon="card"
        />
      </div>
    </section>
  );
}
