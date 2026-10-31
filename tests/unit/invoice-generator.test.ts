import { calculateInvoiceTotal } from "../../src/modules/billing/invoice-generator";

const total = calculateInvoiceTotal([
  {
    description: "Monthly subscription",
    quantity: 2,
    unitAmount: 100000,
  },
  {
    description: "Setup fee",
    quantity: 1,
    unitAmount: 50000,
  },
]);

if (total !== 250000) {
  throw new Error(`Expected 250000, received ${total}`);
}

console.log("Invoice generator test passed!");