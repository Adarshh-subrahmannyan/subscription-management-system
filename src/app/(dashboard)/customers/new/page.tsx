"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          active: true,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error?.message ?? payload.error ?? "Failed to create customer.");

      router.push("/customers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="New customer"
        description="Add a new customer account to create subscriptions and issue invoices."
      />

      <form onSubmit={handleSubmit} className="card max-w-2xl space-y-5 p-6">
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <label className="block text-sm font-semibold text-ink">
            Customer / Company name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Acme Global Inc"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="billing@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-ink">Phone number</label>
            <input
              type="text"
              placeholder="+91-9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink">Billing address</label>
          <textarea
            placeholder="Street address, City, State, Postal code"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create customer"}
          </button>
        </div>
      </form>
    </section>
  );
}
