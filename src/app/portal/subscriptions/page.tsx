import { EmptyState } from "@/components/shared/empty-state";

export default function PortalSubscriptionsPage() {
  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">My Subscriptions</h1>
      <p className="text-sm text-ink-muted mb-6">All your active and past subscriptions.</p>
      <div className="card overflow-hidden">
        <EmptyState
          title="No subscriptions yet"
          description="Your subscriptions will appear here once your account is set up."
          icon="repeat"
        />
      </div>
    </section>
  );
}
