"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { apiRequest } from "@/lib/client-api";

type Customer = { id: string; name: string; email: string; active: boolean };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      apiRequest<Customer[]>(`/api/customers?page=1&pageSize=100&search=${encodeURIComponent(search)}`, {
        signal: controller.signal,
      })
        .then(setCustomers)
        .catch((requestError: unknown) => {
          if (!controller.signal.aborted) {
            setError(requestError instanceof Error ? requestError.message : "Unable to load customers.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  return (
    <section>
      <PageHeader
        title="Customers"
        description="View and manage all customer accounts and their subscription history."
      />

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input
            type="search"
            placeholder="Search customers…"
            aria-label="Search customers"
            value={search}
            onChange={(event) => {
              setLoading(true);
              setError(null);
              setSearch(event.target.value);
            }}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
      </div>

      {loading ? <LoadingState columns={4} /> : error ? (
        <ErrorState message={error} onRetry={() => {
          setLoading(true);
          setError(null);
          apiRequest<Customer[]>(`/api/customers?page=1&pageSize=100&search=${encodeURIComponent(search)}`)
            .then(setCustomers)
            .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load customers."))
            .finally(() => setLoading(false));
        }} />
      ) : customers.length === 0 ? (
        <EmptyState title="No customers" description={search ? "No customers match your search." : "Customer accounts will appear here."} icon="users" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Customer", "Email", "Subscriptions", "Status", ""].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand text-xs font-bold ring-2 ring-brand/10">
                          {c.name.charAt(0)}
                        </span>
                        <a href={`/customers/${c.id}`} className="font-semibold text-ink hover:text-brand transition-colors">
                          {c.name}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{c.email}</td>
                    <td className="px-5 py-4 text-ink-muted tabular">—</td>
                    <td className="px-5 py-4"><StatusBadge status={c.active ? "active" : "inactive"} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/customers/${c.id}`} aria-label={`View ${c.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
                          <Icon name="eye" className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
