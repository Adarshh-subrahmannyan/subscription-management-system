export const BILLING_FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;
export type BillingFrequency = (typeof BILLING_FREQUENCIES)[number];

export type PlanItemInput = {
  productId: string;
  quantity: number;
};

export type PlanInput = {
  name: string;
  description?: string | null;
  price: number;
  billingFrequency: BillingFrequency;
  minimumQuantity?: number;
  availabilityStart?: string | null;
  availabilityEnd?: string | null;
  autoClose?: boolean;
  allowEarlyClosure?: boolean;
  allowPause?: boolean;
  allowRenewal?: boolean;
  active?: boolean;
  items?: PlanItemInput[];
};

export function parsePlanDate(value: string | null | undefined, field: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${field} must be a valid date.`);
  return date;
}

export function validatePlan(input: PlanInput) {
  if (!input.name.trim()) throw new Error("Plan name is required.");
  if (!Number.isInteger(input.price) || input.price < 0) {
    throw new Error("Plan price must be a non-negative integer in cents.");
  }
  if (!BILLING_FREQUENCIES.includes(input.billingFrequency)) {
    throw new Error("Billing frequency must be daily, weekly, monthly, or yearly.");
  }
  const minimumQuantity = input.minimumQuantity ?? 1;
  if (!Number.isInteger(minimumQuantity) || minimumQuantity < 1) {
    throw new Error("Minimum quantity must be at least 1.");
  }
  const availabilityStart = parsePlanDate(input.availabilityStart, "Availability start");
  const availabilityEnd = parsePlanDate(input.availabilityEnd, "Availability end");
  if (availabilityStart && availabilityEnd && availabilityStart > availabilityEnd) {
    throw new Error("Availability end must be on or after availability start.");
  }
  const items = (input.items ?? []).map((item) => {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Plan items need a product and a quantity of at least 1.");
    }
    return item;
  });
  return { ...input, name: input.name.trim(), description: input.description?.trim() || null,
    minimumQuantity, availabilityStart, availabilityEnd, items };
}
