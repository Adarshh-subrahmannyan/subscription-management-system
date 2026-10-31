"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";

type Variant = {
  id: string;
  name: string;
  priceDelta: number;
  active: boolean;
};

type ProductDetail = {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  costPrice: number | null;
  notes: string | null;
  active: boolean;
  variants: Variant[];
  planItems: Array<{ plan: { id: string; name: string; price: number; billingFrequency: string } }>;
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canManage = session?.user?.role === "admin";

  const loadProduct = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/products/${id}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error?.message ?? payload.error ?? "Unable to load product.");
        const data = payload.data ?? payload;
        setProduct(data);
        setName(data.name);
        setType(data.type);
        setSalesPrice((data.salesPrice / 100).toString());
        setCostPrice(data.costPrice ? (data.costPrice / 100).toString() : "");
        setNotes(data.notes ?? "");
        setActive(data.active);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load product.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadProduct();
  }, [status, loadProduct]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: type.trim(),
          salesPrice: Math.round(Number(salesPrice) * 100),
          costPrice: costPrice ? Math.round(Number(costPrice) * 100) : null,
          notes: notes.trim() || null,
          active,
          variants: product?.variants ?? [],
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message ?? payload.error ?? "Failed to update product.");

      setIsEditing(false);
      loadProduct();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error updating product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section>
        <PageHeader title="Product" description="Loading…" />
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">
          Loading product…
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section>
        <PageHeader title="Product" description="Not found" />
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error ?? "Product not found."}
        </p>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title={product.name}
        description={`Type: ${product.type}`}
        badge={product.active ? "Active" : "Inactive"}
        actions={
          canManage ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted transition-colors"
            >
              <Icon name="edit" className="h-4 w-4" />
              {isEditing ? "Close edit" : "Edit product"}
            </button>
          ) : undefined
        }
      />

      {isEditing && (
        <form onSubmit={handleSave} className="mb-6 card p-6 border-brand/30">
          <h3 className="font-bold text-ink mb-4">Edit Product Details</h3>
          {saveError && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 mb-4">{saveError}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Product name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Type</label>
              <input
                type="text"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Sales price (INR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={salesPrice}
                onChange={(e) => setSalesPrice(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Cost price (optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Details & Variants */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-bold text-ink">Pricing & Specifications</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Sales price</dt>
                <dd className="text-xl font-bold text-ink tabular">{formatCurrency(product.salesPrice)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Cost price</dt>
                <dd className="text-xl font-medium text-ink-muted tabular">
                  {product.costPrice ? formatCurrency(product.costPrice) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted mb-0.5">Status</dt>
                <dd className="font-semibold capitalize text-ink">{product.active ? "Active" : "Inactive"}</dd>
              </div>
            </dl>
            {product.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-ink-muted">Notes</p>
                <p className="text-sm text-ink mt-1">{product.notes}</p>
              </div>
            )}
          </div>

          {/* Variants Table */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-sm font-bold text-ink">Variants</h2>
            </div>
            {product.variants.length === 0 ? (
              <div className="p-6 text-center text-sm text-ink-muted">
                No variants configured for this product.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Variant name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Price delta</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v) => (
                    <tr key={v.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3.5 font-medium text-ink">{v.name}</td>
                      <td className="px-5 py-3.5 tabular text-ink font-semibold">
                        {v.priceDelta >= 0 ? `+${formatCurrency(v.priceDelta)}` : formatCurrency(v.priceDelta)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                          {v.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Plans Included In */}
        <div className="card p-5 h-fit space-y-4">
          <h2 className="text-sm font-bold text-ink">Included in Plans</h2>
          {product.planItems.length === 0 ? (
            <p className="text-xs text-ink-muted">
              This product is not currently part of any subscription plan.
            </p>
          ) : (
            <div className="space-y-3">
              {product.planItems.map(({ plan }) => (
                <div key={plan.id} className="p-3 rounded-xl bg-surface-muted border border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-ink">{plan.name}</p>
                      <p className="text-xs text-ink-muted capitalize">{plan.billingFrequency}</p>
                    </div>
                    <span className="font-bold text-xs text-brand tabular">
                      {formatCurrency(plan.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
