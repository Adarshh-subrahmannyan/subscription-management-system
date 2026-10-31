type ApiErrorResponse = {
  error?: string | { message?: string };
};

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorResponse = result as ApiErrorResponse | null;
    const message =
      typeof errorResponse?.error === "string"
        ? errorResponse.error
        : errorResponse?.error?.message;
    throw new Error(message || `Request failed (${response.status}).`);
  }

  if (
    result !== null &&
    typeof result === "object" &&
    "data" in result
  ) {
    return (result as { data: T }).data;
  }
  return result as T;
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}
