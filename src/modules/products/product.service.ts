import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";
import { validateProduct, type ProductInput } from "./product.validation";

function assertAdmin(role: Role) {
  if (role !== "admin") throw new Error("Only admins can modify products.");
}

export async function createProduct(role: Role, input: ProductInput) {
  assertAdmin(role);
  const validated = validateProduct(input);

  return prisma.product.create({
    data: {
      name: validated.name,
      type: validated.type,
      salesPrice: validated.salesPrice,
      costPrice: validated.costPrice,
      notes: validated.notes,
      active: validated.active,
      variants: {
        create: validated.variants.map((variant) => ({
          name: variant.name,
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
  const validated = validateProduct(input);

  return prisma.$transaction(async (transaction) => {
    await transaction.productVariant.deleteMany({ where: { productId: id } });
    return transaction.product.update({
      where: { id },
      data: {
        name: validated.name,
        type: validated.type,
        salesPrice: validated.salesPrice,
        costPrice: validated.costPrice,
        notes: validated.notes,
        active: validated.active,
        variants: {
          create: validated.variants.map((variant) => ({
            name: variant.name,
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
