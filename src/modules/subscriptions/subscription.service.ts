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
    const existing = await transaction.subscription.findUnique({
      where: { quotationId },
      include: { lines: true, customer: true, plan: true },
    });
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

export async function createSubscription(
  role: Role,
  input: {
    customerId: string;
    planId: string;
    startDate: string;
    paymentTerms?: string;
  },
) {
  assertCanManage(role);
  const start = validateSubscriptionStartDate(input.startDate);

  const [customer, plan] = await Promise.all([
    prisma.customer.findUnique({ where: { id: input.customerId } }),
    prisma.plan.findUnique({
      where: { id: input.planId },
      include: { items: { include: { product: true } } },
    }),
  ]);

  if (!customer) throw new Error("Customer not found.");
  if (!plan) throw new Error("Plan not found.");

  const nextBilling = new Date(start);
  if (plan.billingFrequency === "daily") nextBilling.setDate(nextBilling.getDate() + 1);
  else if (plan.billingFrequency === "weekly") nextBilling.setDate(nextBilling.getDate() + 7);
  else if (plan.billingFrequency === "yearly") nextBilling.setFullYear(nextBilling.getFullYear() + 1);
  else nextBilling.setMonth(nextBilling.getMonth() + 1);

  return prisma.subscription.create({
    data: {
      number: subscriptionNumber(),
      customerId: input.customerId,
      planId: input.planId,
      status: "active",
      startDate: start,
      nextBillingDate: nextBilling,
      paymentTerms: input.paymentTerms ?? "net_30",
      lines: {
        create: plan.items.map((item) => {
          const unitPrice = item.product.salesPrice;
          const taxAmount = Math.round(unitPrice * 0.18);
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            taxAmount,
            amount: (unitPrice + taxAmount) * item.quantity,
          };
        }),
      },
    },
    include: { lines: true, customer: true, plan: true },
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
    include: {
      lines: { include: { product: true } },
      customer: true,
      plan: true,
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, number: true, status: true, total: true, paidAmount: true, issuedAt: true, dueAt: true },
      },
    },
  });
}
