import {
  calculateInvoiceTotal,
  type InvoiceLineItem,
} from "../billing/invoice-generator";

export type InvoiceStatus = "pending" | "paid";

export interface Invoice {
  id: string;
  customerId: string;
  items: InvoiceLineItem[];
  totalAmount: number;
  status: InvoiceStatus;
  createdAt: Date;
}

const invoices = new Map<string, Invoice>();

export function createInvoice(
  customerId: string,
  items: InvoiceLineItem[]
): Invoice {
  if (!customerId.trim()) {
    throw new Error("Customer ID is required.");
  }

  const invoice: Invoice = {
    id: crypto.randomUUID(),
    customerId,
    items,
    totalAmount: calculateInvoiceTotal(items),
    status: "pending",
    createdAt: new Date(),
  };

  invoices.set(invoice.id, invoice);
  return invoice;
}

export function getAllInvoices(): Invoice[] {
  return Array.from(invoices.values());
}

export function getInvoice(id: string): Invoice | undefined {
  return invoices.get(id);
}

export function markInvoicePaid(id: string): Invoice {
  const invoice = invoices.get(id);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  const updated = { ...invoice, status: "paid" as const };
  invoices.set(id, updated);
  return updated;
}