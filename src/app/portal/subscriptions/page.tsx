"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Subscription = {
  id: string;
  number: string;
  status: string;
  nextBillingDate: string | null;
  plan: { name: string; price: number; billingFrequency: string };
};

export default function PortalSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Subscription[]>("/api/subscriptions?page=1")
      .then(setSubscriptions)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load subscriptions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1 className="text-xl font-bold text-ink mb-1">My Subscriptions</h1>
      <p className="text-sm text-ink-muted mb-6">All your active and past subscriptions.</p>
      {loading ? <LoadingState columns={4} /> : error ? (
        <ErrorState message={error} />
      ) : subscriptions.length === 0 ? (
        <div className="card overflow-hidden">
          <EmptyState title="No subscriptions yet" description="Your subscriptions will appear here once your account is set up." icon="repeat" />
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((subscription) => (
            <article key={subscription.id} className="card flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-semibold text-ink truncate">{subscription.plan.name}</p>
                <p className="mt-1 text-xs text-ink-muted">{subscription.number} · Next billing {formatDate(subscription.nextBillingDate)}</p>
                <p className="mt-1 text-xs text-ink-muted">{subscription.plan.billingFrequency}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-bold text-ink">{formatCurrency(subscription.plan.price)}</p>
                <div className="mt-2"><StatusBadge status={subscription.status} /></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
