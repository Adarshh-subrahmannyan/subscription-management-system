"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { apiRequest, formatCurrency } from "@/lib/client-api";

type Product = {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  variants: { id: string }[];
  active: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Product[]>("/api/products")
      .then(setProducts)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load products."))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );

  return (
    <section>
      <PageHeader
        title="Products"
        description="Manage your product catalogue, pricing, variants, and availability."
        actions={
          <a
            href="/products/new"
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add product
          </a>
        }
      />

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input
            type="search"
            placeholder="Search products…"
            aria-label="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Icon name="filter" className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      {loading ? <LoadingState columns={5} /> : error ? (
        <ErrorState message={error} onRetry={() => {
          setLoading(true);
          setError(null);
          apiRequest<Product[]>("/api/products")
            .then(setProducts)
            .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load products."))
            .finally(() => setLoading(false));
        }} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title={search ? "No matching products" : "No products yet"}
          description={search ? "Try a different search." : "Add your first product to start building subscription plans."}
          icon="package"
          action={
            <a
              href="/products/new"
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors"
            >
              <Icon name="plus" className="h-4 w-4" />
              Add product
            </a>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Product", "Type", "Sales price", "Variants", "Status", ""].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand text-xs font-bold">
                          {product.name.charAt(0)}
                        </span>
                        <a
                          href={`/products/${product.id}`}
                          className="font-semibold text-ink hover:text-brand transition-colors"
                        >
                          {product.name}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{product.type}</td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">{formatCurrency(product.salesPrice)}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      {product.variants.length === 0
                        ? <span className="text-ink-faint">—</span>
                        : `${product.variants.length} variant${product.variants.length !== 1 ? "s" : ""}`}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={product.active ? "active" : "inactive"} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`/products/${product.id}`}
                          aria-label={`View ${product.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </a>
                        <a
                          href={`/products/${product.id}`}
                          aria-label={`Edit ${product.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-surface-muted/40">
            <p className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-1">
              <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="chevron" className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" disabled className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon name="chevron" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
