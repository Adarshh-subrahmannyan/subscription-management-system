import { PageHeader } from "@/components/layout/page-header";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

const MOCK_INVOICES = [
  { id: "inv-1", number: "INV-0041", customer: "Acme Corp",     date: "Oct 31, 2026", due: "Nov 7, 2026",  total: "₹60,000", paid: "₹0",      status: "confirmed" },
  { id: "inv-2", number: "INV-0040", customer: "TechStart Ltd", date: "Oct 15, 2026", due: "Oct 22, 2026", total: "₹5,000",  paid: "₹5,000",  status: "paid"      },
  { id: "inv-3", number: "INV-0039", customer: "GreenLeaf Inc", date: "Oct 1, 2026",  due: "Oct 8, 2026",  total: "₹2,500",  paid: "₹0",      status: "overdue"   },
];

export default function InvoicesPage() {
  return (
    <section>
      <PageHeader
        title="Invoices"
        description="Track all invoices, payment status, and outstanding balances."
      />

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
          <input type="search" placeholder="Search invoices…" aria-label="Search invoices"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors"
          />
        </div>
      </div>

      {MOCK_INVOICES.length === 0 ? (
        <EmptyState title="No invoices" description="Invoices will appear here once subscriptions are active." icon="receipt" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-muted/60">
                  {["Invoice", "Customer", "Date", "Due date", "Total", "Status", ""].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-ink-muted">{inv.number}</td>
                    <td className="px-5 py-4">
                      <a href={`/invoices/${inv.id}`} className="font-semibold text-ink hover:text-brand transition-colors">{inv.customer}</a>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{inv.date}</td>
                    <td className="px-5 py-4 text-ink-muted">{inv.due}</td>
                    <td className="px-5 py-4 font-semibold text-ink tabular">{inv.total}</td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`/invoices/${inv.id}`} aria-label={`View ${inv.number}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
                          <Icon name="eye" className="h-4 w-4" />
                        </a>
                        <button type="button" aria-label={`Download ${inv.number}`}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-faint hover:bg-surface-muted hover:text-ink transition-colors">
                          <Icon name="download" className="h-4 w-4" />
                        </button>
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
