"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { apiRequest, formatCurrency, formatDate } from "@/lib/client-api";

type Discount = {
  id: string;
  name: string;
  kind: string;
  value: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Discount[]>("/api/discounts")
      .then(setDiscounts)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load discounts."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <PageHeader
        title="Discounts"
        description="Configure fixed and percentage discount rules with eligibility settings."
      />
      {loading ? <LoadingState columns={4} /> : error ? (
        <ErrorState message={error} onRetry={() => {
          setLoading(true);
          setError(null);
          apiRequest<Discount[]>("/api/discounts")
            .then(setDiscounts)
            .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load discounts."))
            .finally(() => setLoading(false));
        }} />
      ) : discounts.length === 0 ? (
        <EmptyState title="No discounts" description="Discount rules will appear here once configured." icon="discount" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-border bg-surface-muted/60">
                {["Name", "Discount", "Start date", "End date", "Status"].map((heading) => (
                  <th key={heading} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">{heading}</th>
                ))}
              </tr></thead>
              <tbody>{discounts.map((discount) => (
                <tr key={discount.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-semibold text-ink">{discount.name}</td>
                  <td className="px-5 py-4 text-ink-muted">{discount.kind === "percentage" ? `${discount.value / 100}%` : formatCurrency(discount.value)}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(discount.startsAt)}</td>
                  <td className="px-5 py-4 text-ink-muted">{formatDate(discount.endsAt)}</td>
                  <td className="px-5 py-4"><StatusBadge status={discount.active ? "active" : "inactive"} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
