import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function ReportsPage() {
  return (
    <section>
      <PageHeader
        title="Reports"
        description="Financial reports including revenue, outstanding invoices, and subscription analytics."
      />
      <div className="card overflow-hidden">
        <EmptyState
          title="Coming soon"
          description="This page is being built. Data will appear here once the API is connected."
          icon="chart"
        />
      </div>
    </section>
  );
}
