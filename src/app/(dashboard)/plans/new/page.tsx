"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { apiRequest } from "@/lib/client-api";

type Product = { id: string; name: string };

export default function NewPlanPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", billingFrequency: "monthly" });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<Product[]>("/api/products?pageSize=100")
      .then(setProducts)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load products."));
  }, []);

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  function toggleProduct(productId: string) {
    setSelectedProducts((current) => current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid non-negative plan price.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/api/plans", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Math.round(price * 100),
          billingFrequency: form.billingFrequency,
          items: selectedProducts.map((productId) => ({ productId, quantity: 1 })),
        }),
      });
      router.replace("/plans");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader title="New plan" description="Define a subscription plan and its products." />
      <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-semibold text-ink">Plan name
          <input required value={form.name} onChange={update("name")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
        </label>
        <label className="block text-sm font-semibold text-ink">Description
          <textarea rows={3} value={form.description} onChange={update("description")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink">Price (₹)
            <input required type="number" min="0" step="0.01" value={form.price} onChange={update("price")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
          </label>
          <label className="block text-sm font-semibold text-ink">Billing frequency
            <select value={form.billingFrequency} onChange={update("billingFrequency")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal">
              {["daily", "weekly", "monthly", "yearly"].map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
            </select>
          </label>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Included products</legend>
          {products.length === 0 ? <p className="mt-2 text-sm text-ink-muted">No products available. Create a product first, or continue without one.</p> : (
            <div className="mt-2 space-y-2">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm text-ink">
                  <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleProduct(product.id)} />
                  {product.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>
        <div className="flex justify-end gap-3">
          <a href="/plans" className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink-muted">Cancel</a>
          <button type="submit" disabled={saving} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Create plan"}</button>
        </div>
      </form>
    </section>
  );
}
