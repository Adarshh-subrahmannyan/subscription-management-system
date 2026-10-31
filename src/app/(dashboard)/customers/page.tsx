"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
  _count?: { subscriptions: number };
};

export default function CustomersPage() {
  const { status } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback((q: string) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: "1", pageSize: "50" });
    if (q) params.set("search", q);
    fetch(`/api/customers?${params}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load customers.");
        // API returns array directly
        setCustomers(Array.isArray(payload) ? payload : payload.data ?? []);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load customers.")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadCustomers("");
  }, [status, loadCustomers]);

  // Debounce search
  useEffect(() => {
    if (status !== "authenticated") return;
    const timer = setTimeout(() => loadCustomers(search), 300);
    return () => clearTimeout(timer);
  }, [search, status, loadCustomers]);

  return (
    <section>
      <PageHeader
        title="Customers"
        description="View and manage all customer accounts and their subscription history."
        actions={
          <a
            href="/customers/new"
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add customer
          </a>
        }
      />

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input
            type="search"
            placeholder="Search customers…"
            aria-label="Search customers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">
          Loading customers…
        </div>
      ) : error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={search ? "Try a different search term." : "Add your first customer to get started."}
          icon="users"
          action={
            !search ? (
              <a href="/customers/new" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors">
                <Icon name="plus" className="h-4 w-4" />
                Add customer
              </a>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Customer", "Email", "Phone", "Status", ""].map((h) => (
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
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <a href={`/customers/${c.id}`} className="font-semibold text-ink hover:text-brand transition-colors">
                          {c.name}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{c.email}</td>
                    <td className="px-5 py-4 text-ink-muted">{c.phone ?? "—"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.active ? "active" : "closed"} label={c.active ? "Active" : "Inactive"} />
                    </td>
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
          <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-surface-muted/40">
            <p className="text-xs text-ink-muted">
              Showing <span className="font-semibold text-ink">{customers.length}</span> customer{customers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
