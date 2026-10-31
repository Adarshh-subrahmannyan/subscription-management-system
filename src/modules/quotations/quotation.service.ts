import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";

type QuotationLineInput = {
  productId: string;
  quantity: number;
  unitPrice?: number;
  taxAmount?: number;
};

export type QuotationInput = {
  customerId: string;
  planId?: string | null;
  validUntil: string;
  lines: QuotationLineInput[];
  taxTotal?: number;
  discountTotal?: number;
};

function assertCanManageQuotation(role: Role) {
  if (role !== "admin" && role !== "staff") {
    throw new Error("Admin or staff access required.");
  }
}

function validateInput(input: QuotationInput) {
  if (!input.customerId || !input.lines.length) {
    throw new Error("Customer and at least one quotation line are required.");
  }
  const validUntil = new Date(input.validUntil);
  if (Number.isNaN(validUntil.getTime()) || validUntil <= new Date()) {
    throw new Error("Quotation validity must be a future date.");
  }
  for (const line of input.lines) {
    if (!line.productId || !Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new Error("Quotation quantities must be positive integers.");
    }
    if (
      line.unitPrice !== undefined &&
      (!Number.isSafeInteger(line.unitPrice) || line.unitPrice < 0)
    ) {
      throw new Error("Quotation prices must be non-negative integer cents.");
    }
    if (
      line.taxAmount !== undefined &&
      (!Number.isSafeInteger(line.taxAmount) || line.taxAmount < 0)
    ) {
      throw new Error("Quotation taxes must be non-negative integer cents.");
    }
  }
  return validUntil;
}

function quotationNumber() {
  return `QT-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}

export async function createQuotation(
  role: Role,
  createdById: string,
  input: QuotationInput,
) {
  assertCanManageQuotation(role);
  const validUntil = validateInput(input);

  const [customer, plan, products] = await Promise.all([
    prisma.customer.findUnique({ where: { id: input.customerId } }),
    input.planId ? prisma.plan.findUnique({ where: { id: input.planId } }) : null,
    prisma.product.findMany({
      where: { id: { in: input.lines.map((line) => line.productId) } },
    }),
  ]);
  if (!customer) throw new Error("Customer not found.");
  if (input.planId && !plan) throw new Error("Plan not found.");
  if (products.length !== new Set(input.lines.map((line) => line.productId)).size) {
    throw new Error("One or more quotation products were not found.");
  }

  const productPrices = new Map(products.map((product) => [product.id, product.salesPrice]));
  const lines = input.lines.map((line) => {
    const unitPrice = line.unitPrice ?? productPrices.get(line.productId)!;
    const taxAmount = line.taxAmount ?? 0;
    return {
      productId: line.productId,
      quantity: line.quantity,
      unitPrice,
      taxAmount,
      amount: unitPrice * line.quantity + taxAmount,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const taxTotal = input.taxTotal ?? lines.reduce((sum, line) => sum + line.taxAmount, 0);
  const discountTotal = input.discountTotal ?? 0;
  if (discountTotal < 0 || !Number.isSafeInteger(discountTotal)) {
    throw new Error("Discount must be a non-negative integer in cents.");
  }

  return prisma.quotation.create({
    data: {
      number: quotationNumber(),
      customerId: input.customerId,
      planId: input.planId ?? null,
      createdById,
      validUntil,
      subtotal,
      taxTotal,
      discountTotal,
      total: subtotal + taxTotal - discountTotal,
      lines: { create: lines },
    },
    include: { lines: { include: { product: true } }, customer: true, plan: true },
  });
}

export function listQuotations(role: Role, customerId: string | null, page = 1) {
  const pageSize = 20;
  return prisma.quotation.findMany({
    where: role === "customer" ? { customerId: customerId ?? "__none__" } : undefined,
    skip: Math.max(0, page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: { lines: true, customer: true, plan: true },
  });
}

export function getQuotation(role: Role, customerId: string | null, id: string) {
  return prisma.quotation.findFirst({
    where: { id, ...(role === "customer" ? { customerId: customerId ?? "__none__" } : {}) },
    include: { lines: { include: { product: true } }, customer: true, plan: true },
  });
}
