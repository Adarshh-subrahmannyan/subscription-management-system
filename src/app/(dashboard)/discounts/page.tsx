"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";

type Discount = {
  id: string;
  name: string;
  kind: string; // "percentage" | "fixed"
  value: number; // basis points for %, cents for fixed
  minimumPurchase: number | null;
  minimumQuantity: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  active: boolean;
  createdAt: string;
};

function formatDiscountValue(kind: string, value: number) {
  if (kind === "percentage") {
    return `${(value / 100).toFixed(2).replace(".00", "")}%`;
  }
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function DiscountsPage() {
  const { data: session, status } = useSession();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const canManage = session?.user.role === "admin";

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError(null);
    fetch("/api/discounts?pageSize=50")
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load discounts.");
        setDiscounts(payload.data ?? []);
        setTotal(payload.total ?? 0);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load discounts.")
      )
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <section>
      <PageHeader
        title="Discounts"
        description="Configure fixed and percentage discount rules with eligibility settings."
        actions={
          canManage ? (
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors"
            >
              <Icon name="plus" className="h-4 w-4" />
              New discount
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">Loading discounts…</div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : discounts.length === 0 ? (
        <EmptyState
          title="No discounts configured"
          description={canManage ? "Create discount rules to apply to quotations and subscriptions." : "No discounts are available."}
          icon="discount"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Name", "Type", "Value", "Starts", "Ends", "Usage", "Status"].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-ink">{d.name}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted capitalize">
                        {d.kind}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">
                      {formatDiscountValue(d.kind, d.value)}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(d.startsAt)}</td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(d.endsAt)}</td>
                    <td className="px-5 py-4 text-ink-muted tabular">
                      {d.usageCount}{d.usageLimit ? `/${d.usageLimit}` : ""}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={d.active ? "active" : "closed"} label={d.active ? "Active" : "Inactive"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-5 py-3.5 bg-surface-muted/40">
            <p className="text-xs text-ink-muted">
              <span className="font-semibold text-ink">{total}</span> discount{total !== 1 ? "s" : ""} configured
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
