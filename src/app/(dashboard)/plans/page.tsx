"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { apiRequest, formatCurrency } from "@/lib/client-api";
import { Icon } from "@/components/layout/icon";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingFrequency: string;
  active: boolean;
  items: { id: string }[];
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Plan[]>("/api/plans")
      .then(setPlans)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load plans."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageHeader
        title="Plans"
        description="Manage subscription plans, billing frequency, and availability."
        actions={<a href="/plans/new" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600"><Icon name="plus" className="h-4 w-4" />Add plan</a>}
      />
      {loading ? <LoadingState columns={5} /> : error ? (
        <ErrorState message={error} onRetry={() => {
          setLoading(true);
          setError(null);
          apiRequest<Plan[]>("/api/plans")
            .then(setPlans)
            .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load plans."))
            .finally(() => setLoading(false));
        }} />
      ) : plans.length === 0 ? (
        <EmptyState title="No plans yet" description="Plans will appear here once created." icon="layers" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-border bg-surface-muted/60">
                {["Plan", "Billing frequency", "Products", "Price", "Status"].map((heading) => (
                  <th key={heading} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">{heading}</th>
                ))}
              </tr></thead>
              <tbody>{plans.map((plan) => (
                <tr key={plan.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4"><p className="font-semibold text-ink">{plan.name}</p>{plan.description && <p className="mt-1 text-xs text-ink-muted">{plan.description}</p>}</td>
                  <td className="px-5 py-4 text-ink-muted">{plan.billingFrequency}</td>
                  <td className="px-5 py-4 text-ink-muted">{plan.items.length}</td>
                  <td className="px-5 py-4 font-semibold text-ink">{formatCurrency(plan.price)}</td>
                  <td className="px-5 py-4"><StatusBadge status={plan.active ? "active" : "inactive"} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
