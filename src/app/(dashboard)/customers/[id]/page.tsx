"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/layout/icon";

type CustomerSubscription = {
  id: string;
  number: string;
  status: string;
  startDate: string;
  nextBillingDate: string | null;
  plan: { name: string; price: number; billingFrequency: string };
};

type CustomerInvoice = {
  id: string;
  number: string;
  status: string;
  total: number;
  paidAmount: number;
  issuedAt: string | null;
  dueAt: string | null;
};

type CustomerDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  active: boolean;
  createdAt: string;
  subscriptions: CustomerSubscription[];
  invoices: CustomerInvoice[];
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit customer state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canManage = session?.user?.role === "admin" || session?.user?.role === "staff";

  const loadCustomer = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/customers/${id}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Unable to load customer.");
        setCustomer(payload);
        setName(payload.name);
        setEmail(payload.email);
        setPhone(payload.phone ?? "");
        setAddress(payload.address ?? "");
        setActive(payload.active);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Unable to load customer.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadCustomer();
  }, [status, loadCustomer]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          active,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Unable to update customer.");
      setIsEditing(false);
      loadCustomer();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error saving customer.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section>
        <PageHeader title="Customer" description="Loading…" />
        <div className="card p-10 flex items-center justify-center text-ink-muted text-sm">
          Loading customer profile…
        </div>
      </section>
    );
  }

  if (error || !customer) {
    return (
      <section>
        <PageHeader title="Customer" description="Not found" />
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error ?? "Customer not found."}
        </p>
      </section>
    );
  }

  const activeSubs = customer.subscriptions.filter((s) => s.status === "active").length;
  const totalBilled = customer.invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = customer.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  return (
    <section>
      <PageHeader
        title={customer.name}
        description={customer.email}
        badge={customer.active ? "Active" : "Inactive"}
        actions={
          canManage ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted transition-colors"
            >
              <Icon name="edit" className="h-4 w-4" />
              {isEditing ? "Close edit" : "Edit profile"}
            </button>
          ) : undefined
        }
      />

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleUpdate} className="mb-6 card p-6 border-brand/30">
          <h3 className="font-bold text-ink mb-4">Edit Customer Profile</h3>
          {saveError && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 mb-4">{saveError}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Company / Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">Status</label>
              <select
                value={active ? "active" : "inactive"}
                onChange={(e) => setActive(e.target.value === "active")}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-brand"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted mb-1">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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

      {/* KPI Cards for this customer */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-ink-muted">Active subscriptions</p>
          <p className="text-2xl font-bold text-ink mt-1">{activeSubs}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-muted">Total subscriptions</p>
          <p className="text-2xl font-bold text-ink mt-1">{customer.subscriptions.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-muted">Total billed</p>
          <p className="text-2xl font-bold text-ink mt-1 tabular">{formatCurrency(totalBilled)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ink-muted">Total collected</p>
          <p className="text-2xl font-bold text-green-700 mt-1 tabular">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subscriptions & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscriptions */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">Subscriptions</h2>
              {canManage && (
                <Link
                  href="/subscriptions/new"
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  + New subscription
                </Link>
              )}
            </div>
            {customer.subscriptions.length === 0 ? (
              <div className="p-6 text-center text-sm text-ink-muted">
                No subscriptions created yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Number
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Plan
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Started
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customer.subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                      <td className="px-5 py-3.5">
                        <Link href={`/subscriptions/${sub.id}`} className="font-mono text-xs text-brand hover:underline">
                          {sub.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-ink font-medium">{sub.plan.name}</td>
                      <td className="px-5 py-3.5 text-ink-muted tabular">{formatDate(sub.startDate)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={sub.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Invoices */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-sm font-bold text-ink">Invoices</h2>
            </div>
            {customer.invoices.length === 0 ? (
              <div className="p-6 text-center text-sm text-ink-muted">
                No invoices issued yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Invoice
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Issued
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Total
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Paid
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customer.invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                      <td className="px-5 py-3.5">
                        <Link href={`/invoices/${inv.id}`} className="font-mono text-xs text-brand hover:underline">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted tabular">{formatDate(inv.issuedAt)}</td>
                      <td className="px-5 py-3.5 font-semibold text-ink tabular">{formatCurrency(inv.total)}</td>
                      <td className="px-5 py-3.5 text-ink-muted tabular">{formatCurrency(inv.paidAmount)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="card p-5 h-fit space-y-4">
          <h2 className="text-sm font-bold text-ink">Contact Details</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-ink-muted">Email address</p>
              <p className="font-medium text-ink mt-0.5">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Phone</p>
              <p className="font-medium text-ink mt-0.5">{customer.phone ?? "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Address</p>
              <p className="font-medium text-ink mt-0.5 whitespace-pre-line">
                {customer.address ?? "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Account created</p>
              <p className="font-medium text-ink mt-0.5">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
