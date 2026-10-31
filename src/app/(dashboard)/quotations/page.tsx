import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function QuotationsPage() {
  return (
    <section>
      <PageHeader
        title="Quotations"
        description="Create and manage sales quotations before converting to subscriptions."
      />
      <div className="card overflow-hidden">
        <EmptyState
          title="Coming soon"
          description="This page is being built. Data will appear here once the API is connected."
          icon="file"
        />
      </div>
    </section>
  );
}
