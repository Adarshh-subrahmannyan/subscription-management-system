import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";
import { validatePlan, type PlanInput } from "./plan.validation";

function assertAdmin(role: Role) {
  if (role !== "admin") throw new Error("Only admins can modify plans.");
}

function planData(input: PlanInput) {
  const validated = validatePlan(input);
  return {
    name: validated.name,
    description: validated.description,
    price: validated.price,
    billingFrequency: validated.billingFrequency,
    minimumQuantity: validated.minimumQuantity,
    availabilityStart: validated.availabilityStart,
    availabilityEnd: validated.availabilityEnd,
    autoClose: input.autoClose ?? false,
    allowEarlyClosure: input.allowEarlyClosure ?? false,
    allowPause: input.allowPause ?? false,
    allowRenewal: input.allowRenewal ?? true,
    active: input.active ?? true,
  };
}

export async function createPlan(role: Role, input: PlanInput) {
  assertAdmin(role);
  const validated = validatePlan(input);

  return prisma.plan.create({
    data: {
      ...planData(input),
      items: {
        create: validated.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });
}

export async function updatePlan(role: Role, id: string, input: PlanInput) {
  assertAdmin(role);
  const validated = validatePlan(input);

  return prisma.$transaction(async (transaction) => {
    await transaction.planItem.deleteMany({ where: { planId: id } });
    return transaction.plan.update({
      where: { id },
      data: {
        ...planData(input),
        items: {
          create: validated.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
  });
}

export function listPlans(options?: { page?: number; pageSize?: number }) {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 20));
  return prisma.plan.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
}

export function getPlan(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
}
