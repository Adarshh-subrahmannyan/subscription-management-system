"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/layout/icon";
import { apiRequest } from "@/lib/client-api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) { setError("Email is required."); return; }

    setIsSubmitting(true);
    try {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong. Please try again.");
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
        <h1 className="text-2xl font-bold text-ink">Reset your password</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          We&apos;ll send you a link to reset your password
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        {sent ? (
          /* Success state */
          <div className="flex flex-col items-center text-center py-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 mb-4">
              <Icon name="check" className="h-6 w-6" />
            </span>
            <h2 className="text-base font-bold text-ink">Check your inbox</h2>
            <p className="mt-2 text-sm text-ink-muted max-w-xs">
              If an account exists for <strong className="text-ink">{email}</strong>, you&apos;ll receive a reset link shortly.
            </p>
            <Link
              href="/login"
              className="mt-6 flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate aria-label="Reset password form">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <Icon name="alert" className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="reset-email" className="mb-1.5 block text-sm font-semibold text-ink">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder-ink-faint transition-colors outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
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
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand rounded">
          Sign in
        </Link>
      </p>
    </div>
  );
}
