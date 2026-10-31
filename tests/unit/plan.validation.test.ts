import { validatePlan } from "../../src/modules/plans/plan.validation";

const plan = validatePlan({
  name: "Monthly plan",
  price: 2500,
  billingFrequency: "monthly",
  minimumQuantity: 2,
  availabilityStart: "2026-11-01T00:00:00.000Z",
  availabilityEnd: "2026-12-01T00:00:00.000Z",
});

if (plan.minimumQuantity !== 2 || plan.billingFrequency !== "monthly") {
  throw new Error("Valid plan was not normalized correctly.");
}

let rejected = false;
try {
  validatePlan({
    name: "Invalid plan",
    price: 2500,
    billingFrequency: "monthly",
    availabilityStart: "2026-12-01T00:00:00.000Z",
    availabilityEnd: "2026-11-01T00:00:00.000Z",
  });
} catch {
  rejected = true;
}
if (!rejected) throw new Error("Invalid plan dates were accepted.");

console.log("Plan validation test passed!");
