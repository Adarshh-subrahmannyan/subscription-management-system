import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

const MOCK_CUSTOMERS = [
  { id: "cust-1", name: "Acme Corp",    email: "admin@acme.com",    subscriptions: 2, status: "active" },
  { id: "cust-2", name: "TechStart Ltd",email: "info@techstart.io", subscriptions: 1, status: "active" },
  { id: "cust-3", name: "GreenLeaf Inc",email: "ops@greenleaf.co",  subscriptions: 1, status: "pending"},
];

export default function CustomersPage() {
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
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
      </div>

      {MOCK_CUSTOMERS.length === 0 ? (
        <EmptyState title="No customers" description="Customer accounts will appear here." icon="users" />
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
                {MOCK_CUSTOMERS.map((c) => (
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
                    <td className="px-5 py-4 text-ink-muted tabular">{c.subscriptions}</td>
                    <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
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
