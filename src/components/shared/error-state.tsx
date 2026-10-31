import { Icon } from "@/components/layout/icon";
import type { ReactNode } from "react";

type ErrorStateProps = Readonly<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
}>;

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading data. Please try again.",
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-red-50 text-red-500 shadow-card mb-5 border border-red-100">
        <Icon name="alert" className="h-7 w-7" />
      </span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted leading-6">{message}</p>
      <div className="mt-6 flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            type="button"
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Icon name="refresh" className="h-4 w-4" />
            Try again
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
