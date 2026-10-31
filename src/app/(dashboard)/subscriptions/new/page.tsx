"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

type Customer = {
  id: string;
  name: string;
  email: string;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  billingFrequency: string;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerId, setCustomerId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentTerms, setPaymentTerms] = useState("net_30");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/customers?pageSize=100").then((r) => r.json()),
      fetch("/api/plans?pageSize=100").then((r) => r.json()),
    ])
      .then(([customersData, plansData]) => {
        const custList = Array.isArray(customersData) ? customersData : customersData.data ?? [];
        const planList = plansData.data ?? [];
        setCustomers(custList);
        setPlans(planList);
        if (custList.length > 0) setCustomerId(custList[0].id);
        if (planList.length > 0) setPlanId(planList[0].id);
      })
      .catch((err) => setError("Failed to load form prerequisites."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          planId,
          startDate: new Date(startDate).toISOString(),
          paymentTerms,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Failed to create subscription.");

      router.push("/subscriptions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating subscription.");
    } finally {
      setSaving(false);
    }
  }

  const selectedPlan = plans.find((p) => p.id === planId);

  return (
    <section>
      <PageHeader
        title="New subscription"
        description="Provision a subscription plan for an existing customer account."
      />

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">
          Loading prerequisites…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card max-w-2xl space-y-6 p-6">
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              Select Customer <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1">
              Select Plan <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)} / {p.billingFrequency}
                </option>
              ))}
            </select>
            {selectedPlan && (
              <p className="text-xs text-ink-muted mt-2">
                Billing rate: <span className="font-semibold text-ink">{formatCurrency(selectedPlan.price)}</span> per{" "}
                <span className="capitalize">{selectedPlan.billingFrequency}</span>
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Start date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Payment terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              >
                <option value="immediate">Immediate</option>
                <option value="net_15">Net 15 days</option>
                <option value="net_30">Net 30 days</option>
                <option value="net_60">Net 60 days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create subscription"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
