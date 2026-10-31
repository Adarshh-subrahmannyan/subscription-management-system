import Link from "next/link";

export function Sidebar() {
  return (
    <aside>
      <Link href="/dashboard">Subscription Management</Link>
      <nav aria-label="Main navigation">
        <Link href="/products">Products</Link>{" "}
        <Link href="/subscriptions">Subscriptions</Link>{" "}
        <Link href="/customers">Customers</Link>{" "}
        <Link href="/invoices">Invoices</Link>
      </nav>
    </aside>
  );
}
