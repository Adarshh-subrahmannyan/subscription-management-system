"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { EmptyState } from "@/components/shared/empty-state";

type Product = {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  active: boolean;
  variants: Array<{ id: string }>;
};

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const canManage = session?.user.role === "admin";

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/products")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message || payload.error || "Unable to load products.");
        setProducts(payload.data ?? []);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load products."));
  }, [status]);

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(cents / 100);

  return (
    <section>
      <PageHeader
        title="Products"
        description="Manage your product catalogue, pricing, variants, and availability."
        actions={canManage ? (
          <Link href="/products/new" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600">
            <Icon name="plus" className="h-4 w-4" /> Add product
          </Link>
        ) : undefined}
      />
      {status === "loading" ? <p className="text-sm text-ink-muted">Loading products…</p> :
        error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> :
        products.length === 0 ? (
          <EmptyState title="No products yet" description={canManage ? "Add your first product to start building subscription plans." : "No products are available yet."} icon="package"
            action={canManage ? <Link href="/products/new" className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white">Add product</Link> : undefined} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr className="border-b border-border bg-surface-muted/60">
                  {["Product", "Type", "Sales price", "Variants", "Status"].map((heading) => <th key={heading} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">{heading}</th>)}
                </tr></thead>
                <tbody>{products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60">
                    <td className="px-5 py-4"><Link className="font-semibold text-ink hover:text-brand" href={`/products/${product.id}`}>{product.name}</Link></td>
                    <td className="px-5 py-4 text-ink-muted">{product.type}</td>
                    <td className="px-5 py-4 font-semibold tabular">{formatPrice(product.salesPrice)}</td>
                    <td className="px-5 py-4 text-ink-muted">{product.variants.length}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{product.active ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
    </section>
  );
}
