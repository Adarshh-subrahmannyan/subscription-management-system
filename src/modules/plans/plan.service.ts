import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";

export const BILLING_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;
export type BillingFrequency = (typeof BILLING_FREQUENCIES)[number];

export type PlanItemInput = {
  productId: string;
  quantity: number;
};

export type PlanInput = {
  name: string;
  description?: string | null;
  price: number;
  billingFrequency: BillingFrequency;
  minimumQuantity?: number;
  availabilityStart?: string | null;
  availabilityEnd?: string | null;
  autoClose?: boolean;
  allowEarlyClosure?: boolean;
  allowPause?: boolean;
  allowRenewal?: boolean;
  active?: boolean;
  items?: PlanItemInput[];
};

function assertAdmin(role: Role) {
  if (role !== "admin") throw new Error("Only admins can modify plans.");
}

function parseDate(value: string | null | undefined, field: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${field} must be a valid date.`);
  return date;
}

function validatePlan(input: PlanInput) {
  if (!input.name.trim()) throw new Error("Plan name is required.");
  if (!Number.isInteger(input.price) || input.price < 0) {
    throw new Error("Plan price must be a non-negative integer in cents.");
  }
  if (!BILLING_FREQUENCIES.includes(input.billingFrequency)) {
    throw new Error("Billing frequency must be daily, weekly, monthly, or yearly.");
  }
  if (!Number.isInteger(input.minimumQuantity) || (input.minimumQuantity ?? 1) < 1) {
    throw new Error("Minimum quantity must be at least 1.");
  }
  const start = parseDate(input.availabilityStart, "Availability start");
  const end = parseDate(input.availabilityEnd, "Availability end");
  if (start && end && start > end) {
    throw new Error("Availability end must be on or after availability start.");
  }
  for (const item of input.items ?? []) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Plan items need a product and a quantity of at least 1.");
    }
  }
}

function planData(input: PlanInput) {
  return {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    price: input.price,
    billingFrequency: input.billingFrequency,
    minimumQuantity: input.minimumQuantity ?? 1,
    availabilityStart: parseDate(input.availabilityStart, "Availability start"),
    availabilityEnd: parseDate(input.availabilityEnd, "Availability end"),
    autoClose: input.autoClose ?? false,
    allowEarlyClosure: input.allowEarlyClosure ?? false,
    allowPause: input.allowPause ?? false,
    allowRenewal: input.allowRenewal ?? true,
    active: input.active ?? true,
  };
}

export async function createPlan(role: Role, input: PlanInput) {
  assertAdmin(role);
  validatePlan(input);

  return prisma.plan.create({
    data: {
      ...planData(input),
      items: {
        create: (input.items ?? []).map((item) => ({
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
  validatePlan(input);

  return prisma.$transaction(async (transaction) => {
    await transaction.planItem.deleteMany({ where: { planId: id } });
    return transaction.plan.update({
      where: { id },
      data: {
        ...planData(input),
        items: {
          create: (input.items ?? []).map((item) => ({
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
