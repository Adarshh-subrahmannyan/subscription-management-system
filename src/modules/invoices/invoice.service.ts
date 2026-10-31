import { prisma } from "@/lib/prisma";

export interface InvoiceLineItem {
  productId: string;
  description: string;
  quantity: number;
  unitAmount: number;
  taxAmount?: number;
}

export async function createInvoice(
  customerId: string,
  items: InvoiceLineItem[],
  billingPeriod?: string
) {
  if (!customerId?.trim()) {
    throw new Error("Customer ID is required.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Invoice must contain at least one item.");
  }

  const lines = items.map((item) => {
    if (!item.productId?.trim()) {
      throw new Error("Product ID is required for every invoice item.");
    }

    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Quantity must be positive.");
    }

    if (!Number.isSafeInteger(item.unitAmount) || item.unitAmount < 0) {
      throw new Error("Unit amount must be non-negative.");
    }

    const taxAmount = item.taxAmount ?? 0;
    const subtotal = item.quantity * item.unitAmount;

    if (!Number.isSafeInteger(taxAmount) || taxAmount < 0) {
      throw new Error("Tax amount must be non-negative.");
    }

    return {
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitAmount,
      taxAmount,
      amount: subtotal + taxAmount,
      subtotal,
    };
  });

  const subtotal = lines.reduce((sum, item) => sum + item.subtotal, 0);
  const taxTotal = lines.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + taxTotal;

  if (![subtotal, taxTotal, total].every(Number.isSafeInteger)) {
    throw new Error("Invoice total is too large.");
  }

  const period =
    billingPeriod ?? new Date().toISOString().slice(0, 7);

  return prisma.invoice.create({
    data: {
      number: `INV-${Date.now()}`,
      customerId,
      billingPeriod: period,
      status: "draft",
      subtotal,
      taxTotal,
      discountTotal: 0,
      total,
      lines: {
        create: lines.map(({ subtotal: _subtotal, ...line }) => line),
      },
    },
    include: {
      lines: true,
    },
  });
}

export async function getAllInvoices() {
  return prisma.invoice.findMany({
    include: { lines: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { lines: true, customer: true },
  });
}

export async function markInvoicePaid(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
  });

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  return prisma.invoice.update({
    where: { id },
    data: {
      status: "paid",
      paidAmount: invoice.total,
    },
  });
}