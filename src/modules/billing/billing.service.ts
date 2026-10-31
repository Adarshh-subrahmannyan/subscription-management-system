export type BillingStatus = "pending" | "paid" | "failed";

export function getBillingStatus(status: BillingStatus) {
  return status;
}

export interface BillingInput {
  unitPrice: number;
  quantity: number;
  discountPercent?: number;
  taxRateBps?: number;
}

export interface BillingResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export function calculateBillingAmount(
  input: BillingInput
): BillingResult {
  const {
    unitPrice,
    quantity,
    discountPercent = 0,
    taxRateBps = 0,
  } = input;

  if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) {
    throw new Error("Unit price must be a non-negative integer in minor currency units.");
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer.");
  }

  if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
    throw new Error("Discount must be between 0 and 100.");
  }

  if (!Number.isSafeInteger(taxRateBps) || taxRateBps < 0 || taxRateBps > 10000) {
    throw new Error("Tax rate must be between 0 and 10000 basis points.");
  }

  const subtotal = unitPrice * quantity;

  if (!Number.isSafeInteger(subtotal)) {
    throw new Error("Billing amount is too large.");
  }

  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Math.round(taxableAmount * taxRateBps / 10000);
  const totalAmount = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount,
  };
}