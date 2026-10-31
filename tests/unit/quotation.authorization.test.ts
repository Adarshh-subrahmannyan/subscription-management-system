import { createQuotation } from "../../src/modules/quotations";
import { convertQuotationToSubscription } from "../../src/modules/subscriptions";

async function main() {
  const input = {
    customerId: "customer-1",
    validUntil: "2099-01-01T00:00:00.000Z",
    lines: [{ productId: "product-1", quantity: 1 }],
  };

  for (const action of [
    () => createQuotation("customer", "user-1", input),
    () => convertQuotationToSubscription("customer", "quotation-1", "2099-01-01T00:00:00.000Z"),
  ]) {
    let rejected = false;
    try {
      await action();
    } catch (error) {
      rejected = error instanceof Error && error.message.includes("Admin or staff");
    }
    if (!rejected) throw new Error("Customer quotation mutation was not rejected.");
  }

  console.log("Quotation authorization test passed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
