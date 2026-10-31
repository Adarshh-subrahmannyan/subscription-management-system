"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { apiRequest } from "@/lib/client-api";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", type: "", salesPrice: "", costPrice: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const salesPrice = Number(form.salesPrice);
    const costPrice = form.costPrice === "" ? null : Number(form.costPrice);
    if (!Number.isFinite(salesPrice) || salesPrice < 0) {
      setError("Enter a valid non-negative sales price.");
      return;
    }
    if (costPrice !== null && (!Number.isFinite(costPrice) || costPrice < 0)) {
      setError("Enter a valid non-negative cost price.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          salesPrice: Math.round(salesPrice * 100),
          costPrice: costPrice === null ? null : Math.round(costPrice * 100),
          notes: form.notes,
        }),
      });
      router.replace("/products");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader title="New product" description="Add a product to your catalogue." />
      <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-semibold text-ink">Product name
          <input required minLength={1} value={form.name} onChange={update("name")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
        </label>
        <label className="block text-sm font-semibold text-ink">Type
          <input required value={form.type} onChange={update("type")} placeholder="Software, add-on…" className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink">Sales price (₹)
            <input required type="number" min="0" step="0.01" value={form.salesPrice} onChange={update("salesPrice")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
          </label>
          <label className="block text-sm font-semibold text-ink">Cost price (₹)
            <input type="number" min="0" step="0.01" value={form.costPrice} onChange={update("costPrice")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
          </label>
        </div>
        <label className="block text-sm font-semibold text-ink">Notes
          <textarea rows={4} value={form.notes} onChange={update("notes")} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-normal" />
        </label>
        <div className="flex justify-end gap-3">
          <a href="/products" className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-ink-muted">Cancel</a>
          <button type="submit" disabled={saving} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Create product"}</button>
        </div>
      </form>
    </section>
  );
}
