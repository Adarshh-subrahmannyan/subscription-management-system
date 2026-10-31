import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";

export type ProductVariantInput = {
  name: string;
  priceDelta: number;
  active?: boolean;
};

export type ProductInput = {
  name: string;
  type: string;
  salesPrice: number;
  costPrice?: number | null;
  notes?: string | null;
  active?: boolean;
  variants?: ProductVariantInput[];
};

function assertAdmin(role: Role) {
  if (role !== "admin") throw new Error("Only admins can modify products.");
}

function validateProduct(input: ProductInput) {
  if (!input.name.trim() || !input.type.trim()) {
    throw new Error("Product name and type are required.");
  }
  if (!Number.isInteger(input.salesPrice) || input.salesPrice < 0) {
    throw new Error("Sales price must be a non-negative integer in cents.");
  }
  if (
    input.costPrice !== undefined &&
    input.costPrice !== null &&
    (!Number.isInteger(input.costPrice) || input.costPrice < 0)
  ) {
    throw new Error("Cost price must be a non-negative integer in cents.");
  }
  for (const variant of input.variants ?? []) {
    if (!variant.name.trim() || !Number.isInteger(variant.priceDelta)) {
      throw new Error("Each variant needs a name and integer price adjustment.");
    }
  }
}

export async function createProduct(role: Role, input: ProductInput) {
  assertAdmin(role);
  validateProduct(input);

  return prisma.product.create({
    data: {
      name: input.name.trim(),
      type: input.type.trim(),
      salesPrice: input.salesPrice,
      costPrice: input.costPrice,
      notes: input.notes?.trim() || null,
      active: input.active ?? true,
      variants: {
        create: (input.variants ?? []).map((variant) => ({
          name: variant.name.trim(),
          priceDelta: variant.priceDelta,
          active: variant.active ?? true,
        })),
      },
    },
    include: { variants: true },
  });
}

export async function updateProduct(
  role: Role,
  id: string,
  input: ProductInput,
) {
  assertAdmin(role);
  validateProduct(input);

  return prisma.$transaction(async (transaction) => {
    await transaction.productVariant.deleteMany({ where: { productId: id } });
    return transaction.product.update({
      where: { id },
      data: {
        name: input.name.trim(),
        type: input.type.trim(),
        salesPrice: input.salesPrice,
        costPrice: input.costPrice,
        notes: input.notes?.trim() || null,
        active: input.active ?? true,
        variants: {
          create: (input.variants ?? []).map((variant) => ({
            name: variant.name.trim(),
            priceDelta: variant.priceDelta,
            active: variant.active ?? true,
          })),
        },
      },
      include: { variants: true },
    });
  });
}

export function listProducts(options?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 20));
  return prisma.product.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });
}

export function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { variants: true, planItems: { include: { plan: true } } },
  });
}
