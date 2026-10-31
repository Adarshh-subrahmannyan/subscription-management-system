import { calculateBillingAmount } from "../../src/modules/billing/billing.service";

const result = calculateBillingAmount({
  unitPrice: 100000,
  quantity: 2,
  discountPercent: 10,
});

if (
  result.subtotal !== 200000 ||
  result.discountAmount !== 20000 ||
  result.totalAmount !== 180000
) {
  throw new Error("Billing calculation test failed!");
}

console.log("Billing calculation test passed!");