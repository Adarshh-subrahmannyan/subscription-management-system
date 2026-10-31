import { canAccessCustomerData } from "../../src/lib/permissions";

if (!canAccessCustomerData("customer", "customer-1", "customer-1")) {
  throw new Error("Customers should access their own records.");
}
if (canAccessCustomerData("customer", "customer-1", "customer-2")) {
  throw new Error("Customers should not access another customer's records.");
}
if (!canAccessCustomerData("staff", null, "customer-2")) {
  throw new Error("Staff should access permitted customer records.");
}

console.log("Customer ownership test passed!");
