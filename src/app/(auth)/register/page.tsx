"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/layout/icon";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) { setError("Full name is required."); return; }
    if (!form.email)        { setError("Email is required."); return; }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with real registration API call.
      await new Promise((r) => setTimeout(r, 1000));
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Brand mark */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-brand text-white shadow-brand mb-4">
          <Icon name="layers" className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Join the Subscript workspace
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate aria-label="Create account form">
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <Icon name="alert" className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full name */}
          <div className="mb-4">
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-ink">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Jane Smith"
              value={form.name}
              onChange={set("name")}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder-ink-faint transition-colors outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-semibold text-ink">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              value={form.email}
              onChange={set("email")}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder-ink-faint transition-colors outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="reg-password" className="mb-1.5 block text-sm font-semibold text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set("password")}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pr-11 text-sm text-ink placeholder-ink-faint transition-colors outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-lg text-ink-faint hover:text-ink transition-colors"
              >
                <Icon name="eye" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="mb-6">
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-ink">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set("confirm")}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 pr-11 text-sm text-ink placeholder-ink-faint transition-colors outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-lg text-ink-faint hover:text-ink transition-colors"
              >
                <Icon name="eye" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-brand transition-all duration-150 hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand rounded">
          Sign in
        </Link>
      </p>
    </div>
  );
}
