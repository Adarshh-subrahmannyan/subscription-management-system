import { Icon } from "@/components/layout/icon";
import type { IconName } from "@/components/layout/icon";
import type { ReactNode } from "react";

type EmptyStateProps = Readonly<{
  title: string;
  description?: string;
  icon?: IconName;
  action?: ReactNode;
}>;

export function EmptyState({
  title,
  description,
  icon = "layers",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-surface text-ink-faint shadow-card mb-5 border border-border">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink-muted leading-6">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
