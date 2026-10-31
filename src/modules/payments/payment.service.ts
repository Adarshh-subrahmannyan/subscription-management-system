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