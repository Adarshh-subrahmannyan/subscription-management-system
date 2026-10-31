import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
};

type DataTableProps<T> = Readonly<{
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
  onRowClick?: (row: T) => void;
}>;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    "px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted whitespace-nowrap",
                    col.align === "right"  ? "text-right"  : "",
                    col.align === "center" ? "text-center" : "text-left",
                    col.className ?? "",
                  ].join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={[
                  "border-b border-border last:border-0 transition-colors",
                  onRowClick
                    ? "cursor-pointer hover:bg-surface-muted/60 focus-within:bg-surface-muted/60"
                    : "",
                ].join(" ")}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      "px-5 py-4 text-ink",
                      col.align === "right"  ? "text-right"  : "",
                      col.align === "center" ? "text-center" : "",
                      col.className ?? "",
                    ].join(" ")}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
