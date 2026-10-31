"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { apiRequest } from "@/lib/client-api";

type Customer = { id: string; name: string; email: string };
type Plan = { id: string; name: string; active: boolean; items: { id: string }[] };

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ customerId: "", planId: "", startDate: new Date().toISOString().slice(0, 10), paymentTerms: "" });
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiRequest<Customer[]>("/api/customers?pageSize=100"),
      apiRequest<Plan[]>("/api/plans?pageSize=100"),
    ])
      .then(([customerData, planData]) => {
        setCustomers(customerData);
        setPlans(planData.filter((plan) => plan.active));
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load subscription options."))
      .finally(() => setLoadingOptions(false));
  }, []);

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiRequest("/api/subscriptions", {
        method: "POST",
        body: JSON.stringify({
          customerId: form.customerId,
          planId: form.planId,
          startDate: form.startDate,
          paymentTerms: form.paymentTerms || null,
        }),
      });
      router.replace("/subscriptions");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create subscription.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader title="New subscription" description="Choose a customer and plan. Prices and included products are loaded by the server." />
      <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loadingOptions ? <p role="status" className="text-sm text-ink-muted">Loading customers and plans…</p> : (
          <>
            <label className="block text-sm font-semibold text-ink">Customer
              <select required value={form.customerId} onChange={update("customerId")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal">
                <option value="">Select a customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} ({customer.email})</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">Plan
              <select required value={form.planId} onChange={update("planId")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal">
                <option value="">Select a plan</option>
                {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {plan.items.length} products</option>)}
              </select>
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-ink">Start date
                <input required type="date" value={form.startDate} onChange={update("startDate")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
              </label>
              <label className="block text-sm font-semibold text-ink">Payment terms
                <input value={form.paymentTerms} onChange={update("paymentTerms")} placeholder="e.g. NET_30" className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
              </label>
            </div>
            {customers.length === 0 && <p className="text-sm text-amber-700">Create a customer before adding a subscription.</p>}
            {plans.length === 0 && <p className="text-sm text-amber-700">Create an active plan before adding a subscription.</p>}
          </>
        )}
        <div className="flex justify-end gap-3">
          <a href="/subscriptions" className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink-muted">Cancel</a>
          <button type="submit" disabled={saving || loadingOptions || customers.length === 0 || plans.length === 0} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Create subscription"}</button>
        </div>
      </form>
    </section>
  );
}
