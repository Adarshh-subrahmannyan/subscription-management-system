import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Subscription Management System</h1>
      <p>Manage subscriptions, billing, and customers in one place.</p>
      <Link href="/dashboard">Open dashboard</Link>
    </main>
  );
}
