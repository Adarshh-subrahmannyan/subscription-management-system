import {
  createPayment,
  updatePaymentStatus,
  simulatePayment,
} from "../../src/modules/payments/payment.service";

const payment = createPayment(
  "INV-001",
  100000,
  "upi"
);

if (payment.status !== "pending") {
  throw new Error("Initial payment status should be pending.");
}

if (payment.amount !== 100000) {
  throw new Error("Payment amount is incorrect.");
}

const updatedPayment = updatePaymentStatus(payment, "completed");

if (updatedPayment.status !== "completed") {
  throw new Error("Payment status update failed.");
}

// Test simulated successful payment
const successfulPayment = simulatePayment(payment, "success");

if (successfulPayment.status !== "completed") {
  throw new Error("Successful payment simulation failed.");
}

// Test simulated failed payment
const failedPayment = simulatePayment(payment, "failure");

if (failedPayment.status !== "failed") {
  throw new Error("Failed payment simulation failed.");
}

console.log("Payment service tests passed!");