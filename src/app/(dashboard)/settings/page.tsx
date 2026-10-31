import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function SettingsPage() {
  return (
    <section>
      <PageHeader
        title="Settings"
        description="Manage your workspace profile and application configuration."
      />
      <div className="card overflow-hidden">
        <EmptyState
          title="Coming soon"
          description="This page is being built. Data will appear here once the API is connected."
          icon="settings"
        />
      </div>
    </section>
  );
}
