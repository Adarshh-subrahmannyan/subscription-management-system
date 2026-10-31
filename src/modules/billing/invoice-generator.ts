export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitAmount: number;
};

export function calculateInvoiceTotal(items: InvoiceLineItem[]) {
  return items.reduce(
    (total, item) => total + item.quantity * item.unitAmount,
    0,
  );
}
