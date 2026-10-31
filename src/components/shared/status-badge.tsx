type StatusVariant =
  | "active"
  | "paid"
  | "confirmed"
  | "pending"
  | "draft"
  | "overdue"
  | "failed"
  | "cancelled"
  | "closed"
  | "paused"
  | "quotation";

type StatusBadgeProps = Readonly<{
  status: StatusVariant | string;
  label?: string;
}>;

const variantMap: Record<string, string> = {
  active:     "status-active",
  paid:       "status-paid",
  confirmed:  "status-active",
  pending:    "status-pending",
  draft:      "status-draft",
  overdue:    "status-overdue",
  failed:     "status-overdue",
  cancelled:  "status-closed",
  closed:     "status-closed",
  paused:     "status-pending",
  quotation:  "status-pending",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const cls = variantMap[status.toLowerCase()] ?? "status-draft";
  const display = label ?? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
      aria-label={`Status: ${display}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {display}
    </span>
  );
}
