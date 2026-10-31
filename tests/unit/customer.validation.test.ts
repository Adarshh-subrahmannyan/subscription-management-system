import { validateCustomerInput } from "../../src/modules/customers";

const customer = validateCustomerInput({
  name: "Ada Lovelace",
  email: " ADA@EXAMPLE.COM ",
});

if (customer.email !== "ada@example.com" || customer.name !== "Ada Lovelace") {
  throw new Error("Customer normalization failed.");
}

let rejected = false;
try {
  validateCustomerInput({ name: "A", email: "invalid" });
} catch {
  rejected = true;
}

if (!rejected) throw new Error("Invalid customer input was accepted.");
console.log("Customer validation test passed!");
