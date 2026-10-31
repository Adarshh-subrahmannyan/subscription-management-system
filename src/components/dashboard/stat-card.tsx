import type { ReactNode } from "react";

type StatCardVariant = "default" | "brand" | "success" | "warning" | "danger";

type StatCardProps = Readonly<{
  title: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  variant?: StatCardVariant;
}>;

const variantStyles: Record<StatCardVariant, { icon: string; badge: string }> =
  {
    default: {
      icon: "bg-brand-50 text-brand",
      badge: "bg-brand-50 text-brand",
    },
    brand: {
      icon: "bg-brand text-white",
      badge: "bg-brand-50 text-brand",
    },
    success: {
      icon: "bg-green-50 text-green-600",
      badge: "bg-green-50 text-green-600",
    },
    warning: {
      icon: "bg-amber-50 text-amber-600",
      badge: "bg-amber-50 text-amber-600",
    },
    danger: {
      icon: "bg-red-50 text-red-600",
      badge: "bg-red-50 text-red-600",
    },
  };

const trendColors = {
  up: "text-green-600 bg-green-50",
  down: "text-red-600 bg-red-50",
  neutral: "text-ink-muted bg-surface-muted",
};

const trendArrows = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export function StatCard({
  title,
  value,
  detail,
  icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <section
      aria-label={title}
      className="card p-5 hover:shadow-card-md transition-shadow duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
            {title}
          </h2>
          <p className="mt-3 text-[1.75rem] font-bold tabular tracking-tight text-ink leading-none">
            {value}
          </p>
          {detail && (
            <p className="mt-1.5 text-xs text-ink-muted font-medium">{detail}</p>
          )}
          {trend && (
            <span
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${trendColors[trend.direction]}`}
            >
              <span aria-hidden="true">{trendArrows[trend.direction]}</span>
              {trend.label}
            </span>
          )}
        </div>
        {icon && (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon} transition-transform duration-200 group-hover:scale-110`}
          >
            {icon}
          </span>
        )}
      </div>
    </section>
  );
}
