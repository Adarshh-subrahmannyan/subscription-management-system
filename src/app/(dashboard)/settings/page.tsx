import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const taxRules = await prisma.taxRule.findMany({ take: 10 });
  const userCount = await prisma.user.count();
  const customerCount = await prisma.customer.count();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Workspace & Settings"
        description="Application environment, authentication profile, and billing configurations."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Account Session */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-ink">Account Profile</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-ink-muted">Name</span>
              <span className="font-semibold text-ink">{session?.user?.name ?? "Administrator"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-ink-muted">Email address</span>
              <span className="font-semibold text-ink">{session?.user?.email ?? "admin@subscript.dev"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-ink-muted">Access Role</span>
              <span className="capitalize font-semibold text-brand px-2.5 py-0.5 rounded-full bg-brand-light text-xs">
                {session?.user?.role ?? "admin"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Auth Strategy</span>
              <span className="font-mono text-xs text-ink">JWT Session</span>
            </div>
          </div>
        </div>

        {/* Database & Environment Status */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-ink">System Environment</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-ink-muted">Database Engine</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                SQLite (Prisma ORM connected)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-ink-muted">Total Registered Users</span>
              <span className="font-semibold text-ink tabular">{userCount} users</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-ink-muted">Total Customers</span>
              <span className="font-semibold text-ink tabular">{customerCount} accounts</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Base Currency</span>
              <span className="font-semibold text-ink">INR (₹)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Configuration */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-ink mb-1">Tax Configurations</h2>
        <p className="text-xs text-ink-muted mb-4">Configured sales tax and VAT rates applied to subscriptions</p>
        {taxRules.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface-muted text-xs text-ink-muted">
            Standard Default Rate: 18.00% GST / VAT applied to services and goods.
          </div>
        ) : (
          <div className="space-y-2">
            {taxRules.map((rule) => (
              <div key={rule.id} className="flex justify-between items-center p-3 rounded-xl bg-surface-muted border border-border">
                <span className="font-semibold text-sm text-ink">{rule.name}</span>
                <span className="font-mono text-xs text-ink-muted">{(rule.rate / 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Credentials Reference Box */}
      <div className="card p-6 border-brand/20 bg-brand-light/20 space-y-3">
        <h3 className="text-sm font-bold text-ink">Demo Credentials Quick Reference</h3>
        <p className="text-xs text-ink-muted">
          The database is seeded with credentials across all access roles:
        </p>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="p-3 rounded-xl bg-surface border border-border">
            <span className="font-bold text-brand block mb-1">Admin</span>
            <span className="text-ink font-mono block">admin@subscript.dev</span>
            <span className="text-ink-muted font-mono block mt-0.5">Admin@123</span>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border">
            <span className="font-bold text-blue-600 block mb-1">Staff</span>
            <span className="text-ink font-mono block">staff@subscript.dev</span>
            <span className="text-ink-muted font-mono block mt-0.5">Staff@123</span>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border">
            <span className="font-bold text-green-700 block mb-1">Customer</span>
            <span className="text-ink font-mono block">acme@subscript.dev</span>
            <span className="text-ink-muted font-mono block mt-0.5">Customer@123</span>
          </div>
        </div>
      </div>
    </section>
  );
}
