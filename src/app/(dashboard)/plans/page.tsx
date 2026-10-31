import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function PlansPage() {
  return (
    <section>
      <PageHeader
        title="Plans"
        description="Manage subscription plans, billing frequency, and availability."
      />
      <div className="card overflow-hidden">
        <EmptyState
          title="Coming soon"
          description="This page is being built. Data will appear here once the API is connected."
          icon="layers"
        />
      </div>
    </section>
  );
}
