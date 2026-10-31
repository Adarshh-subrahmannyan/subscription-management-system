"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";

type PlanItem = { quantity: number; product: { name: string; salesPrice: number } };
type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingFrequency: string;
  minimumQuantity: number;
  active: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  allowEarlyClosure: boolean;
  autoClose: boolean;
  items: PlanItem[];
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(cents / 100);
}

const FREQ_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Annually",
  weekly: "Weekly",
  daily: "Daily",
};

export default function PlansPage() {
  const { data: session, status } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canManage = session?.user.role === "admin";

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/plans?pageSize=50")
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error?.message ?? payload.error ?? "Unable to load plans.");
        setPlans(payload.data ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load plans.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    load();
  }, [status, load]);

  return (
    <section>
      <PageHeader
        title="Plans"
        description="Manage subscription plans, billing frequency, and availability."
        actions={
          canManage ? (
            <Link href="/plans/new" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors">
              <Icon name="plus" className="h-4 w-4" />
              New plan
            </Link>
          ) : undefined
        }
      />

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">Loading plans…</div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : plans.length === 0 ? (
        <EmptyState
          title="No plans yet"
          description={canManage ? "Create your first subscription plan to get started." : "No plans are available yet."}
          icon="layers"
          action={canManage ? (
            <Link href="/plans/new" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors">
              <Icon name="plus" className="h-4 w-4" /> New plan
            </Link>
          ) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="card flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-ink truncate">{plan.name}</h3>
                  {plan.description && <p className="mt-0.5 text-xs text-ink-muted line-clamp-2">{plan.description}</p>}
                </div>
                <StatusBadge status={plan.active ? "active" : "closed"} label={plan.active ? "Active" : "Inactive"} />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-ink tabular">{formatCurrency(plan.price)}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{FREQ_LABELS[plan.billingFrequency] ?? plan.billingFrequency}</p>
                </div>
                <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                  Min qty: {plan.minimumQuantity}
                </span>
              </div>

              {plan.items.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">Includes</p>
                  <ul className="space-y-1">
                    {plan.items.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-center justify-between text-xs text-ink-muted">
                        <span>{item.product.name}</span>
                        <span className="font-medium text-ink">×{item.quantity}</span>
                      </li>
                    ))}
                    {plan.items.length > 3 && (
                      <li className="text-xs text-ink-faint">+{plan.items.length - 3} more items</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="mt-auto flex flex-wrap gap-1.5">
                {plan.allowPause && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Pausable</span>}
                {plan.allowRenewal && <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">Auto-renew</span>}
                {plan.allowEarlyClosure && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Early close</span>}
              </div>

              {canManage && (
                <Link href={`/plans/${plan.id}`}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-semibold text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors">
                  <Icon name="settings" className="h-3.5 w-3.5" />
                  Edit plan
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
