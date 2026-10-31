import {
  createPayment,
  getPayment,
  getAllPayments,
  simulatePayment,
} from "../../src/modules/payments/payment.service";

async function runTests() {
  // Invalid invoice ID
  try {
    await createPayment("", 100000, "upi");
    throw new Error("Empty invoice ID should be rejected.");
  } catch (error) {
    if (error instanceof Error && error.message === "Empty invoice ID should be rejected.") {
      throw error;
    }
  }

  // Invalid amount
  try {
    await createPayment("INV-001", -100, "upi");
    throw new Error("Negative amount should be rejected.");
  } catch (error) {
    if (error instanceof Error && error.message === "Negative amount should be rejected.") {
      throw error;
    }
  }

  const payments = await getAllPayments();
  if (!Array.isArray(payments)) {
    throw new Error("Payment list should be an array.");
  }

  const payment = await getPayment("non-existent-payment");
  if (payment !== null) {
    throw new Error("Missing payment should return null.");
  }

  try {
    await simulatePayment("non-existent-payment", "success");
    throw new Error("Missing payment should not be processed.");
  } catch (error) {
    if (error instanceof Error && error.message === "Missing payment should not be processed.") {
      throw error;
    }
  }

  console.log("Payment service tests passed!");
}

runTests().catch((error) => {
  console.error("Payment service tests failed:", error);
  process.exitCode = 1;
});
