export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "card" | "upi" | "bank_transfer";
  status: PaymentStatus;
  createdAt: Date;
}

export function createPayment(
  invoiceId: string,
  amount: number,
  method: Payment["method"]
): Payment {
  if (!invoiceId.trim()) {
    throw new Error("Invoice ID is required.");
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Payment amount must be a positive integer.");
  }

  return {
    id: crypto.randomUUID(),
    invoiceId,
    amount,
    method,
    status: "pending",
    createdAt: new Date(),
  };
}

export function updatePaymentStatus(
  payment: Payment,
  status: PaymentStatus
): Payment {
  return {
    ...payment,
    status,
  };
}

export function simulatePayment(
  payment: Payment,
  outcome: "success" | "failure"
): Payment {
  if (payment.status !== "pending") {
    throw new Error("Only pending payments can be processed.");
  }

  const newStatus: PaymentStatus =
    outcome === "success" ? "completed" : "failed";

  return updatePaymentStatus(payment, newStatus);
}

const payments = new Map<string, Payment>();

export function savePayment(payment: Payment): Payment {
  payments.set(payment.id, payment);
  return payment;
}

export function getPayment(paymentId: string): Payment | undefined {
  return payments.get(paymentId);
}

export function getAllPayments(): Payment[] {
  return Array.from(payments.values());
}