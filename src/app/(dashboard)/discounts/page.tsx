import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function DiscountsPage() {
  return (
    <section>
      <PageHeader
        title="Discounts"
        description="Configure fixed and percentage discount rules with eligibility settings."
      />
      <div className="card overflow-hidden">
        <EmptyState
          title="Coming soon"
          description="This page is being built. Data will appear here once the API is connected."
          icon="discount"
        />
      </div>
    </section>
  );
}
