import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "./lifecycle";

export function validateSubscriptionStartDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Start date must be valid.");
  return date;
}

export function validateSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === "string" &&
    SUBSCRIPTION_STATUSES.includes(value as SubscriptionStatus);
}
