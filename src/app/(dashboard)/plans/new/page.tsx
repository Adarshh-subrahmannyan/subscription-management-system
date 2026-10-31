"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";

type Product = {
  id: string;
  name: string;
  salesPrice: number;
};

type SelectedProduct = {
  productId: string;
  quantity: number;
};

export default function NewPlanPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "yearly" | "weekly" | "daily">("monthly");
  const [minimumQuantity, setMinimumQuantity] = useState("1");
  const [allowPause, setAllowPause] = useState(false);
  const [allowRenewal, setAllowRenewal] = useState(true);
  const [allowEarlyClosure, setAllowEarlyClosure] = useState(false);
  const [autoClose, setAutoClose] = useState(false);

  const [items, setItems] = useState<SelectedProduct[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products?pageSize=100")
      .then(async (res) => {
        const payload = await res.json();
        setProducts(payload.data ?? []);
      })
      .catch(() => {});
  }, []);

  function handleAddItem() {
    if (products.length === 0) return;
    const available = products.find((p) => !items.some((i) => i.productId === p.id));
    if (available) {
      setItems([...items, { productId: available.id, quantity: 1 }]);
    }
  }

  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: "productId" | "quantity", val: string) {
    const updated = [...items];
    if (field === "productId") {
      updated[index].productId = val;
    } else {
      updated[index].quantity = Math.max(1, parseInt(val) || 1);
    }
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const priceCents = Math.round(Number(price) * 100);
      if (priceCents < 0 || isNaN(priceCents)) throw new Error("Price must be a valid non-negative number.");

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          price: priceCents,
          billingFrequency,
          minimumQuantity: Math.max(1, parseInt(minimumQuantity) || 1),
          allowPause,
          allowRenewal,
          allowEarlyClosure,
          autoClose,
          active: true,
          items,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message ?? payload.error ?? "Failed to create plan.");

      router.push("/plans");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Create subscription plan"
        description="Configure pricing, billing cycle, rules, and bundle included products."
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-ink">Plan Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Plan name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enterprise Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted mb-1">Description</label>
              <textarea
                placeholder="Brief summary of what this plan includes"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Price (INR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="5000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Billing frequency</label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Minimum quantity</label>
              <input
                type="number"
                min="1"
                value={minimumQuantity}
                onChange={(e) => setMinimumQuantity(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        {/* Plan Rules */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-ink">Subscription Rules</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-muted cursor-pointer">
              <input
                type="checkbox"
                checked={allowPause}
                onChange={(e) => setAllowPause(e.target.checked)}
                className="rounded text-brand focus:ring-brand"
              />
              <div>
                <p className="text-sm font-semibold text-ink">Allow pause</p>
                <p className="text-xs text-ink-muted">Customers can pause subscription</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-muted cursor-pointer">
              <input
                type="checkbox"
                checked={allowRenewal}
                onChange={(e) => setAllowRenewal(e.target.checked)}
                className="rounded text-brand focus:ring-brand"
              />
              <div>
                <p className="text-sm font-semibold text-ink">Auto-renew</p>
                <p className="text-xs text-ink-muted">Automatically renew at period end</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-muted cursor-pointer">
              <input
                type="checkbox"
                checked={allowEarlyClosure}
                onChange={(e) => setAllowEarlyClosure(e.target.checked)}
                className="rounded text-brand focus:ring-brand"
              />
              <div>
                <p className="text-sm font-semibold text-ink">Allow early closure</p>
                <p className="text-xs text-ink-muted">Can cancel before contract end</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-surface-muted cursor-pointer">
              <input
                type="checkbox"
                checked={autoClose}
                onChange={(e) => setAutoClose(e.target.checked)}
                className="rounded text-brand focus:ring-brand"
              />
              <div>
                <p className="text-sm font-semibold text-ink">Auto close on expiry</p>
                <p className="text-xs text-ink-muted">Close subscription when expired</p>
              </div>
            </label>
          </div>
        </div>

        {/* Bundled Products */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Included Products</h2>
              <p className="text-xs text-ink-muted">Items provisioned as part of this plan</p>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-muted"
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              Add product
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-ink-muted italic py-2">
              No products bundled yet. Click &quot;Add product&quot; above to bundle catalog items.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-ink-muted">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      className="w-16 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand tabular"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-ink-faint hover:text-brand"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
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
            {saving ? "Creating plan…" : "Create plan"}
          </button>
        </div>
      </form>
    </section>
  );
}
