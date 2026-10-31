import { createProduct } from "../../src/modules/products";

async function main() {
  let rejected = false;
  try {
    await createProduct("staff", {
      name: "Restricted product",
      type: "service",
      salesPrice: 1000,
    });
  } catch (error) {
    rejected = error instanceof Error && error.message.includes("Only admins");
  }
  if (!rejected) throw new Error("Staff product mutation was not rejected.");
  console.log("Product authorization test passed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
