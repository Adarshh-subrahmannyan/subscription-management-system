import type { ReactNode } from "react";

type PageHeaderProps = Readonly<{
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: string;
}>;

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
            {title}
          </h1>
          {badge && (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2 sm:mt-0.5">
          {actions}
        </div>
      )}
    </div>
  );
}
