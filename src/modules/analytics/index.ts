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