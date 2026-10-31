"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", type: "", salesPrice: "", costPrice: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          salesPrice: Math.round(Number(form.salesPrice) * 100),
          costPrice: form.costPrice ? Math.round(Number(form.costPrice) * 100) : null,
          notes: form.notes || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || payload.error || "Unable to create product.");
      router.push("/products");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create product.");
    } finally {
      setSaving(false);
    }
  }

  return <section>
    <PageHeader title="Add product" description="Create a product that can be included in subscription plans." />
    <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-semibold">Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border border-border px-4 py-2.5" /></label>
      <label className="block text-sm font-semibold">Type<input required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1.5 w-full rounded-xl border border-border px-4 py-2.5" placeholder="Software" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">Sales price<input required min="0" step="0.01" type="number" value={form.salesPrice} onChange={(e) => setForm({ ...form, salesPrice: e.target.value })} className="mt-1.5 w-full rounded-xl border border-border px-4 py-2.5" /></label>
        <label className="block text-sm font-semibold">Cost price<input min="0" step="0.01" type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} className="mt-1.5 w-full rounded-xl border border-border px-4 py-2.5" /></label>
      </div>
      <label className="block text-sm font-semibold">Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5 min-h-24 w-full rounded-xl border border-border px-4 py-2.5" /></label>
      <div className="flex justify-end gap-3"><button type="button" onClick={() => router.back()} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Create product"}</button></div>
    </form>
  </section>;
}
