export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitAmount: number;
};

export function calculateInvoiceTotal(items: InvoiceLineItem[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Invoice must contain at least one item.");
  }

  return items.reduce((total, item) => {
    if (!item.description.trim()) {
      throw new Error("Item description is required.");
    }

    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Quantity must be a positive integer.");
    }

    if (!Number.isSafeInteger(item.unitAmount) || item.unitAmount < 0) {
      throw new Error("Unit amount must be a non-negative integer.");
    }

    const lineTotal = item.quantity * item.unitAmount;

    if (!Number.isSafeInteger(lineTotal) ||
        !Number.isSafeInteger(total + lineTotal)) {
      throw new Error("Invoice total is too large.");
    }

    return total + lineTotal;
  }, 0);
}
