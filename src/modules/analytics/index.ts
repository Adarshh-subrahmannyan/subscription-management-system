import { prisma } from "@/lib/prisma";

export async function getBillingAnalytics() {
  const [invoiceSummary, paymentSummary, invoicesByStatus] =
    await Promise.all([
      prisma.invoice.aggregate({
        _count: { _all: true },
        _sum: {
          total: true,
          paidAmount: true,
          taxTotal: true,
          discountTotal: true,
        },
      }),

      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { _all: true },
      }),

      prisma.invoice.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

  const totalInvoiced = invoiceSummary._sum.total ?? 0;
  const totalPaid = invoiceSummary._sum.paidAmount ?? 0;

  return {
    invoiceCount: invoiceSummary._count._all,
    totalInvoiced,
    totalPaid,
    outstandingAmount: Math.max(0, totalInvoiced - totalPaid),
    totalTax: invoiceSummary._sum.taxTotal ?? 0,
    totalDiscount: invoiceSummary._sum.discountTotal ?? 0,
    paymentCount: paymentSummary._count._all,
    totalPaymentsRecorded: paymentSummary._sum.amount ?? 0,
    invoicesByStatus: invoicesByStatus.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),
  };
}

import type { Role } from "@/lib/permissions";

export interface DashboardStats {
  activeSubscriptions: number;
  totalSubscriptions: number;
  totalCustomers: number;
  revenueReceived: number; // cents
  outstandingAmount: number; // cents
  overdueInvoices: number;
}

export interface DetailedReports {
  totalInvoiced: number;
  totalCollected: number;
  collectionRate: number; // percentage
  outstandingBalance: number;
  subscriptionsByStatus: Array<{ status: string; count: number }>;
  paymentsByMethod: Array<{ method: string; count: number; total: number }>;
  topCustomers: Array<{ id: string; name: string; totalSpent: number; subscriptionCount: number }>;
}

export async function getDashboardStats(_role: Role): Promise<DashboardStats> {
  const now = new Date();

  const [
    activeSubscriptions,
    totalSubscriptions,
    totalCustomers,
    revenueAgg,
    outstandingAgg,
    overdueInvoices,
  ] = await Promise.all([
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.subscription.count(),
    prisma.customer.count({ where: { active: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.invoice.aggregate({
      _sum: { total: true, paidAmount: true },
      where: { status: { in: ["draft", "pending", "partial", "confirmed"] } },
    }),
    prisma.invoice.count({
      where: {
        dueAt: { lt: now },
        status: { notIn: ["paid", "void"] },
      },
    }),
  ]);

  const totalInvoiced = outstandingAgg._sum.total ?? 0;
  const totalPaidOnOutstanding = outstandingAgg._sum.paidAmount ?? 0;

  return {
    activeSubscriptions,
    totalSubscriptions,
    totalCustomers,
    revenueReceived: revenueAgg._sum.amount ?? 0,
    outstandingAmount: totalInvoiced - totalPaidOnOutstanding,
    overdueInvoices,
  };
}

export async function getDetailedReports(_role: Role): Promise<DetailedReports> {
  const [invoicesAgg, payments, subscriptionsGroup, customers] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { total: true, paidAmount: true },
    }),
    prisma.payment.findMany({
      select: { method: true, amount: true },
    }),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.customer.findMany({
      include: {
        invoices: { select: { paidAmount: true } },
        subscriptions: { select: { id: true } },
      },
    }),
  ]);

  const totalInvoiced = invoicesAgg._sum.total ?? 0;
  const totalCollected = invoicesAgg._sum.paidAmount ?? 0;
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;
  const outstandingBalance = Math.max(0, totalInvoiced - totalCollected);

  const subscriptionsByStatus = subscriptionsGroup.map((g) => ({
    status: g.status,
    count: g._count.status,
  }));

  // Aggregate payments by method
  const methodMap = new Map<string, { count: number; total: number }>();
  for (const p of payments) {
    const cur = methodMap.get(p.method) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += p.amount;
    methodMap.set(p.method, cur);
  }
  const paymentsByMethod = Array.from(methodMap.entries()).map(([method, data]) => ({
    method,
    count: data.count,
    total: data.total,
  }));

  // Top customers
  const topCustomers = customers
    .map((c) => ({
      id: c.id,
      name: c.name,
      totalSpent: c.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
      subscriptionCount: c.subscriptions.length,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return {
    totalInvoiced,
    totalCollected,
    collectionRate,
    outstandingBalance,
    subscriptionsByStatus,
    paymentsByMethod,
    topCustomers,
  };
}
