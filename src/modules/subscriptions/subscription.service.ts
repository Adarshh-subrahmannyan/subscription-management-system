import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/permissions";
import {
  assertSubscriptionTransition,
  type SubscriptionStatus,
} from "./lifecycle";

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
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) throw new Error("Start date must be valid.");

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
