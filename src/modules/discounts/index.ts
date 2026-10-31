import { prisma } from "@/lib/prisma";

export async function getAllDiscounts() {
  return prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createDiscount(data: {
  name: string;
  kind: "percentage" | "fixed";
  value: number;
  minimumPurchase?: number;
  minimumQuantity?: number;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
}) {
  if (!data.name?.trim()) throw new Error("Discount name is required.");
  if (!Number.isSafeInteger(data.value) || data.value <= 0) {
    throw new Error("Discount value must be a positive integer.");
  }
  if (!["percentage", "fixed"].includes(data.kind)) {
    throw new Error("Kind must be percentage or fixed.");
  }
  if (data.kind === "percentage" && data.value > 10000) {
    throw new Error("Percentage cannot exceed 100%.");
  }

  return prisma.discount.create({
    data: {
      name: data.name.trim(),
      kind: data.kind,
      value: data.value,
      minimumPurchase: data.minimumPurchase,
      minimumQuantity: data.minimumQuantity,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      usageLimit: data.usageLimit,
      active: true,
    },
  });
}