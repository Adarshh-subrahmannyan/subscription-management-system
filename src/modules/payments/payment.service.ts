import { prisma } from "@/lib/prisma";

export type PaymentMethod = "card" | "upi" | "bank_transfer";

export async function createPayment(
  invoiceId: string,
  amount: number,
  method: PaymentMethod
) {
  if (!invoiceId?.trim()) {
    throw new Error("Invoice ID is required.");
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Payment amount must be a positive integer.");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  if (invoice.status === "paid") {
    throw new Error("Invoice is already paid.");
  }

  return prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method,
      note: "Payment created; awaiting confirmation",
    },
  });
}

export async function getAllPayments() {
  return prisma.payment.findMany({
    include: { invoice: true },
    orderBy: { paidAt: "desc" },
  });
}

export async function getPayment(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: true },
  });
}

export async function simulatePayment(
  paymentId: string,
  outcome: "success" | "failure"
) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.note !== "Payment created; awaiting confirmation") {
      throw new Error("Only pending payments can be processed.");
    }

    if (outcome === "failure") {
      return tx.payment.update({
        where: { id: paymentId },
        data: { note: "Payment failed" },
      });
    }

    const invoice = await tx.invoice.findUnique({
      where: { id: payment.invoiceId },
    });

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    const newPaidAmount = invoice.paidAmount + payment.amount;

    if (newPaidAmount > invoice.total) {
      throw new Error("Payment exceeds the outstanding invoice amount.");
    }

    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        paidAt: new Date(),
        note: "Payment completed",
      },
    });

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        status: newPaidAmount >= invoice.total ? "paid" : "partial",
      },
    });

    return updatedPayment;
  });
}