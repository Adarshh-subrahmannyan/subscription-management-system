export type BillingStatus = "pending" | "paid" | "failed";

export function getBillingStatus(status: BillingStatus) {
  return status;
}
