import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";
import {
  assertSubscriptionTransition,
  type SubscriptionStatus,
} from "./lifecycle";
import { validateSubscriptionStartDate } from "./subscription.validation";

function subscriptionNumber() {
  return `SUB-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}

function assertCanManage(role: Role) {
  if (role !== "admin" && role !== "staff") {
    throw new Error("Admin or staff access required.");
  }
}

export type CreateSubscriptionInput = {
  customerId: string;
  planId: string;
  startDate: string;
  paymentTerms?: string | null;
  lines?: Array<{ productId: string; quantity: number }>;
};

export async function createSubscription(role: Role, input: CreateSubscriptionInput) {
  assertCanManage(role);
  if (!input.customerId?.trim() || !input.planId?.trim()) {
    throw new Error("Customer and plan are required.");
  }
  const startDate = validateSubscriptionStartDate(input.startDate);
  const [customer, plan] = await Promise.all([
    prisma.customer.findUnique({ where: { id: input.customerId } }),
    prisma.plan.findUnique({
      where: { id: input.planId },
      include: { items: { include: { product: true } } },
    }),
  ]);
  if (!customer) throw new Error("Customer not found.");
  if (!plan || !plan.active) throw new Error("An active plan is required.");
  if (plan.availabilityStart && startDate < plan.availabilityStart) {
    throw new Error("The plan is not available on the selected start date.");
  }
  if (plan.availabilityEnd && startDate > plan.availabilityEnd) {
    throw new Error("The plan is no longer available on the selected start date.");
  }

  const requestedLines = input.lines?.length
    ? input.lines
    : plan.items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
  if (!requestedLines.length) throw new Error("The selected plan has no products.");
  if (new Set(requestedLines.map((line) => line.productId)).size !== requestedLines.length) {
    throw new Error("Each product can only be included once.");
  }
  const availableItems = new Map(plan.items.map((item) => [item.productId, item]));
  const quantityTotal = requestedLines.reduce((sum, line) => sum + line.quantity, 0);
  if (!Number.isSafeInteger(quantityTotal) || quantityTotal < plan.minimumQuantity) {
    throw new Error(`The plan requires a minimum quantity of ${plan.minimumQuantity}.`);
  }
  const lines = requestedLines.map((line) => {
    const item = availableItems.get(line.productId);
    if (!item || !item.product.active) {
      throw new Error("Every selected product must be active and included in the plan.");
    }
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new Error("Product quantities must be positive integers.");
    }
    const unitPrice = item.product.salesPrice;
    const amount = unitPrice * line.quantity;
    if (!Number.isSafeInteger(amount)) throw new Error("Subscription amount is too large.");
    return { productId: item.productId, quantity: line.quantity, unitPrice, taxAmount: 0, amount };
  });

  return prisma.subscription.create({
    data: {
      number: subscriptionNumber(),
      customerId: customer.id,
      planId: plan.id,
      status: "draft",
      startDate,
      nextBillingDate: startDate,
      paymentTerms: input.paymentTerms?.trim() || null,
      lines: { create: lines },
    },
    include: { lines: true, customer: true, plan: true },
  });
}

export async function convertQuotationToSubscription(
  role: Role,
  quotationId: string,
  startDate: string,
) {
  assertCanManage(role);
  const start = validateSubscriptionStartDate(startDate);

  return prisma.$transaction(async (transaction) => {
    const quotation = await transaction.quotation.findUnique({
      where: { id: quotationId },
      include: { lines: true, plan: true },
    });
    if (!quotation) throw new Error("Quotation not found.");
    if (quotation.status !== "accepted") {
      throw new Error("Only accepted quotations can become subscriptions.");
    }
    if (!quotation.planId || !quotation.plan) {
      throw new Error("An accepted quotation must have a plan.");
    }
    const existing = await transaction.subscription.findUnique({ where: { quotationId } });
    if (existing) return existing;

    return transaction.subscription.create({
      data: {
        number: subscriptionNumber(),
        customerId: quotation.customerId,
        planId: quotation.planId,
        quotationId: quotation.id,
        status: "quotation",
        startDate: start,
        nextBillingDate: start,
        lines: {
          create: quotation.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxAmount: line.taxAmount,
            amount: line.amount,
          })),
        },
      },
      include: { lines: true, customer: true, plan: true },
    });
  });
}

export async function transitionSubscription(
  role: Role,
  id: string,
  nextStatus: SubscriptionStatus,
) {
  assertCanManage(role);
  return prisma.$transaction(async (transaction) => {
    const subscription = await transaction.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!subscription) throw new Error("Subscription not found.");
    assertSubscriptionTransition(subscription.status, nextStatus);
    if (nextStatus === "paused" && !subscription.plan.allowPause) {
      throw new Error("This plan does not allow pausing.");
    }
    if (nextStatus === "closed" && subscription.status !== "paused" && !subscription.plan.allowEarlyClosure) {
      throw new Error("This plan does not allow early closure.");
    }

    return transaction.subscription.update({
      where: { id },
      data: {
        status: nextStatus,
        pausedAt: nextStatus === "paused" ? new Date() : null,
        closedAt: nextStatus === "closed" ? new Date() : null,
      },
      include: { lines: true, customer: true, plan: true },
    });
  });
}

export function listSubscriptions(role: Role, customerId: string | null, page = 1) {
  const pageSize = 20;
  return prisma.subscription.findMany({
    where: role === "customer" ? { customerId: customerId ?? "__none__" } : undefined,
    skip: Math.max(0, page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: { lines: true, customer: true, plan: true },
  });
}

export function getSubscription(role: Role, customerId: string | null, id: string) {
  return prisma.subscription.findFirst({
    where: { id, ...(role === "customer" ? { customerId: customerId ?? "__none__" } : {}) },
    include: { lines: true, customer: true, plan: true },
  });
}
