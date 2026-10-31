import {
  assertSubscriptionTransition,
  canTransitionSubscription,
} from "../../src/modules/subscriptions/lifecycle";

assertSubscriptionTransition("draft", "quotation");
assertSubscriptionTransition("active", "paused");

if (canTransitionSubscription("active", "confirmed")) {
  throw new Error("Active subscriptions must not transition back to confirmed.");
}

let rejected = false;
try {
  assertSubscriptionTransition("closed", "active");
} catch {
  rejected = true;
}

if (!rejected) throw new Error("Closed subscriptions must not be reactivated.");
console.log("Subscription lifecycle test passed!");
