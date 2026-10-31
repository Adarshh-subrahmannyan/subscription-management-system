type LoadingStateProps = Readonly<{
  rows?: number;
  columns?: number;
  message?: string;
}>;

export function LoadingState({
  rows = 5,
  columns = 4,
  message = "Loading…",
}: LoadingStateProps) {
  return (
    <div aria-busy="true" aria-label={message} role="status">
      <div className="sr-only">{message}</div>
      {/* Table skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* Header skeleton */}
        <div className="flex gap-4 border-b border-border px-6 py-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded-full bg-surface-muted"
              style={{ width: `${60 + (i % 3) * 20}px` }}
            />
          ))}
        </div>
        {/* Row skeletons */}
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-0"
          >
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl bg-surface-muted" />
            {Array.from({ length: columns - 1 }).map((_, col) => (
              <div
                key={col}
                className="h-3 animate-pulse rounded-full bg-surface-muted"
                style={{ width: `${40 + ((row + col) % 4) * 15}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardLoadingState({ cards = 3 }: { cards?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading…"
      role="status"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="sr-only">Loading…</div>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-24 animate-pulse rounded-full bg-surface-muted" />
            <div className="h-9 w-9 animate-pulse rounded-2xl bg-surface-muted" />
          </div>
          <div className="h-8 w-32 animate-pulse rounded-lg bg-surface-muted" />
          <div className="h-3 w-40 animate-pulse rounded-full bg-surface-muted" />
        </div>
      ))}
    </div>
  );
}
