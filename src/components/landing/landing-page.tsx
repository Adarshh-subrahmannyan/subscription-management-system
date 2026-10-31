"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/layout/icon";
import { APP_NAME } from "@/lib/constants";
const ROUTES = {
  login: "/login",
  register: "/register",
} as const;

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
] as const;

const FEATURES = [
  {
    icon: "repeat",
    title: "Subscription Management",
    description:
      "Keep every plan, customer, and renewal organized in one clear workspace.",
  },
  {
    icon: "refresh",
    title: "Automated Recurring Billing",
    description:
      "Set billing schedules once and keep recurring charges on track.",
  },
  {
    icon: "receipt",
    title: "Invoice Management",
    description:
      "Create, review, and follow invoices without losing sight of what is due.",
  },
  {
    icon: "card",
    title: "Payment Tracking",
    description:
      "See payment status at a glance and quickly spot outstanding balances.",
  },
  {
    icon: "discount",
    title: "Discount Management",
    description:
      "Manage discounts and offers alongside the plans they belong to.",
  },
  {
    icon: "chart",
    title: "Analytics and Reports",
    description:
      "Bring your subscription activity together in easy-to-read reports.",
  },
] as const;

const SUBSCRIPTIONS = [
  { name: "Pro Workspace", category: "Business plan", amount: "$49.00", mark: "PW", tone: "bg-brand-50 text-brand" },
  { name: "Cloud Storage", category: "Annual plan", amount: "$12.00", mark: "CS", tone: "bg-blue-50 text-blue-600" },
  { name: "Design Suite", category: "Team plan", amount: "$32.00", mark: "DS", tone: "bg-violet-50 text-violet-600" },
] as const;

type FeatureIcon = (typeof FEATURES)[number]["icon"];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="#home" className="inline-flex items-center gap-2.5" aria-label={`${APP_NAME} home`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-brand">
        <Icon name="layers" className="h-5 w-5" />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${inverse ? "text-white" : "text-ink"}`}>
        {APP_NAME}
      </span>
    </Link>
  );
}

function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-ink-muted transition-colors hover:text-brand">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <Link href={ROUTES.login} className="text-sm font-semibold text-ink transition-colors hover:text-brand">
            Login
          </Link>
          <Link href={ROUTES.register} className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-brand-600">
            Get Started
          </Link>
        </div>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-ink transition-colors hover:bg-surface-muted md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
        </button>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-border bg-white px-5 py-4 shadow-card md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={closeMenu} className="rounded-lg px-3 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted">
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3 border-t border-border pt-4">
              <Link href={ROUTES.login} onClick={closeMenu} className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-ink">
                Login
              </Link>
              <Link href={ROUTES.register} onClick={closeMenu} className="flex-1 rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white">
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[570px] lg:ml-auto">
      <div aria-hidden="true" className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-brand/10 via-rose-50 to-blue-50 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.65rem] border border-white bg-white p-3 shadow-[0_28px_90px_-28px_rgba(17,24,39,0.28)] sm:p-4">
        <div className="overflow-hidden rounded-[1.15rem] border border-border bg-[#F8F9FC]">
          <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                <Icon name="layers" className="h-4 w-4" />
              </span>
              <span className="text-xs font-extrabold text-ink">{APP_NAME}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 sm:inline-flex">All systems active</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand">JD</span>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-medium text-ink-muted sm:text-xs">Monday, October 12, 2026</p>
                <h2 className="mt-1 text-base font-extrabold tracking-tight text-ink sm:text-lg">Good morning, Jordan</h2>
              </div>
              <span className="hidden rounded-lg border border-border bg-white px-3 py-2 text-[10px] font-semibold text-ink-muted sm:block">Last 30 days⌄</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <MetricCard label="Monthly revenue" value="$24,580" change="+12.8%" />
              <MetricCard label="Active subscriptions" value="1,284" change="+8.2%" />
              <div className="col-span-2 rounded-xl border border-border bg-white p-3 sm:col-span-1">
                <p className="text-[9px] font-semibold text-ink-muted sm:text-[10px]">Successful payments</p>
                <p className="mt-1 text-lg font-extrabold tracking-tight text-ink sm:text-xl">98.6%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full w-[86%] rounded-full bg-brand" />
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1.35fr_1fr]">
              <div className="rounded-xl border border-border bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-ink sm:text-xs">Revenue overview</p>
                    <p className="mt-0.5 text-[9px] text-ink-muted">Monthly recurring revenue</p>
                  </div>
                  <Icon name="more" className="h-4 w-4 text-ink-faint" />
                </div>
                <div className="mt-4 flex h-[88px] items-end justify-between gap-1 border-b border-border px-1 sm:h-[102px]">
                  {[34, 48, 41, 65, 53, 78, 64, 92, 75, 100, 82, 94].map((height, index) => (
                    <span key={index} className={`w-full max-w-4 rounded-t-sm ${index === 9 ? "bg-brand" : "bg-brand/15"}`} style={{ height: `${height}%` }} />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[8px] text-ink-faint sm:text-[9px]">
                  <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-white p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-ink sm:text-xs">Plan distribution</p>
                  <Icon name="more" className="h-4 w-4 text-ink-faint" />
                </div>
                <div className="flex items-center gap-3 py-3">
                  <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full" style={{ background: "conic-gradient(#D7191C 0 42%, #4778F5 42% 72%, #f5b545 72% 88%, #eceef1 88% 100%)" }}>
                    <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white text-center">
                      <span className="text-[9px] font-extrabold leading-tight text-ink">1,284<small className="block font-medium text-ink-muted">plans</small></span>
                    </div>
                  </div>
                  <div className="space-y-2 text-[9px] text-ink-muted">
                    <Legend color="bg-brand" label="Pro" value="42%" />
                    <Legend color="bg-accent-blue" label="Basic" value="30%" />
                    <Legend color="bg-amber-400" label="Team" value="16%" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-white p-3 sm:p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-ink sm:text-xs">Recent subscriptions</p>
                <a href="#features" className="text-[9px] font-bold text-brand">View all</a>
              </div>
              <div className="space-y-2">
                {SUBSCRIPTIONS.map((subscription) => (
                  <div key={subscription.name} className="flex items-center gap-2.5">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-[8px] font-extrabold ${subscription.tone}`}>{subscription.mark}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[9px] font-bold text-ink sm:text-[10px]">{subscription.name}</span>
                      <span className="block text-[8px] text-ink-muted">{subscription.category}</span>
                    </span>
                    <span className="text-[9px] font-bold text-ink sm:text-[10px]">{subscription.amount}<span className="font-normal text-ink-muted"> /mo</span></span>
                    <span className="hidden rounded-full bg-green-50 px-2 py-1 text-[8px] font-bold text-green-700 sm:inline">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -left-5 top-1/3 hidden items-center gap-3 rounded-2xl border border-white bg-white p-3 shadow-card-md sm:flex lg:-left-12">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600"><Icon name="check" className="h-4 w-4" /></span>
        <span><span className="block text-[10px] font-bold text-ink">Payment received</span><span className="mt-0.5 block text-[9px] text-ink-muted">Invoice #INV-2048</span></span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <p className="text-[9px] font-semibold text-ink-muted sm:text-[10px]">{label}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
        <p className="text-base font-extrabold tracking-tight text-ink sm:text-lg">{value}</p>
        <span className="text-[8px] font-bold text-green-600">{change}</span>
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span>{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: FeatureIcon; title: string; description: string }) {
  return (
    <article className="group rounded-2xl border border-border bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand/20 hover:shadow-card-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
    </article>
  );
}

const STEPS = [
  { number: "01", title: "Create your account", description: "Sign up in moments and set up your workspace around the way you work.", icon: "user" },
  { number: "02", title: "Add and manage subscriptions", description: "Bring your plans and customer subscriptions together in one place.", icon: "layers" },
  { number: "03", title: "Track billing and payments", description: "Keep invoices, payments, and upcoming billing easy to follow.", icon: "chart" },
] as const;

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-ink">
      <LandingHeader />
      <main>
        <section id="home" className="relative scroll-mt-24 bg-gradient-to-b from-[#FCF8F8] via-white to-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-50/80 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-10 lg:pb-28 lg:pt-24">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-white px-3.5 py-2 text-xs font-bold text-brand shadow-card">
                <span className="h-2 w-2 rounded-full bg-brand" />
                Subscription management, made simple
              </div>
              <h1 className="mt-6 text-[2.7rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-ink sm:text-5xl lg:text-[3.55rem]">
                Manage All Your Subscriptions <span className="text-brand">in One Place.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
                Manage subscription plans, track billing, monitor payments, and keep your business organized—all from one clear, simple workspace.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={ROUTES.register} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-bold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-brand-600">
                  Get Started Free <Icon name="arrow-right" className="h-4 w-4" />
                </Link>
                <Link href={ROUTES.login} className="inline-flex min-h-14 items-center justify-center rounded-xl border border-border bg-white px-6 text-sm font-bold text-ink transition-all hover:border-brand/30 hover:bg-brand-50/40">
                  Login to Your Account
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-ink-muted">
                <span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-green-600" />No credit card required</span>
                <span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-green-600" />Get started in minutes</span>
              </div>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section className="border-y border-border bg-white py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 text-center sm:px-8 lg:justify-between lg:px-10">
            <p className="w-full text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint lg:w-auto">Everything your subscription business needs</p>
            <span className="text-sm font-bold text-ink-muted">Plans &amp; customers</span>
            <span className="text-sm font-bold text-ink-muted">Billing &amp; invoices</span>
            <span className="text-sm font-bold text-ink-muted">Payments &amp; insights</span>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 bg-surface-muted/60 px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">Everything in one place</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Less juggling. More growing.</h2>
              <p className="mt-4 text-base leading-7 text-ink-muted">The tools you need to run subscriptions smoothly, from the first plan to the next payment.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">Simple from day one</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Up and running in three steps.</h2>
              <p className="mt-4 text-base leading-7 text-ink-muted">A straightforward way to bring your subscription operations together.</p>
            </div>
            <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
              <div aria-hidden="true" className="absolute left-[17%] right-[17%] top-8 hidden border-t-2 border-dashed border-brand/15 md:block" />
              {STEPS.map((step) => (
                <article key={step.number} className="relative flex flex-col items-center text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/10 bg-white text-brand shadow-card">
                    <Icon name={step.icon} className="h-6 w-6" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[10px] font-extrabold text-white">{step.number}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-ink-muted">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F9FAFC] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand">One clear view</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">Your subscription business, at a glance.</h2>
              <p className="mt-5 text-base leading-7 text-ink-muted">See recurring revenue, active plans, payment health, and recent subscriptions in one easy-to-read dashboard.</p>
              <ul className="mt-7 space-y-3">
                {["Understand your billing at a glance", "Keep tabs on active plans and payments", "Stay on top of recent subscription activity"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-semibold text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600"><Icon name="check" className="h-3 w-3" /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <section id="about" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-center sm:px-12 sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute" />
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-300">Make room to grow</span>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Ready to Take Control of Your Subscriptions?</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Bring plans, billing, invoices, and payments into one organized workspace.</p>
            <Link href={ROUTES.register} className="mt-8 inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brand px-7 text-sm font-bold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-brand-600">
              Get Started Now <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-3 text-sm leading-6 text-ink-muted">A clearer way to manage subscription plans, billing, invoices, and payments.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-ink-muted">
            <a href="#home" className="transition-colors hover:text-brand">Home</a>
            <a href="#features" className="transition-colors hover:text-brand">Features</a>
            <Link href={ROUTES.login} className="transition-colors hover:text-brand">Login</Link>
            <Link href={ROUTES.register} className="transition-colors hover:text-brand">Register</Link>
          </nav>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-border pt-6 text-xs text-ink-faint">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
