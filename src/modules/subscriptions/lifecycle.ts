export const SUBSCRIPTION_STATUSES = [
  "draft",
  "quotation",
  "confirmed",
  "active",
  "paused",
  "closed",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

const transitions: Record<SubscriptionStatus, readonly SubscriptionStatus[]> = {
  draft: ["quotation", "confirmed"],
  quotation: ["confirmed"],
  confirmed: ["active"],
  active: ["paused", "closed"],
  paused: ["active", "closed"],
  closed: [],
};

export function assertSubscriptionTransition(
  current: string,
  next: SubscriptionStatus,
) {
  if (!SUBSCRIPTION_STATUSES.includes(current as SubscriptionStatus)) {
    throw new Error(`Unknown subscription status: ${current}.`);
  }
  if (!transitions[current as SubscriptionStatus].includes(next)) {
    throw new Error(`Cannot transition subscription from ${current} to ${next}.`);
  }
}

export function canTransitionSubscription(
  current: string,
  next: SubscriptionStatus,
) {
  try {
    assertSubscriptionTransition(current, next);
    return true;
  } catch {
    return false;
  }
}
