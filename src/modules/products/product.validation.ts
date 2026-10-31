export type ProductVariantInput = {
  name: string;
  priceDelta: number;
  active?: boolean;
};

export type ProductInput = {
  name: string;
  type: string;
  salesPrice: number;
  costPrice?: number | null;
  notes?: string | null;
  active?: boolean;
  variants?: ProductVariantInput[];
};

export function validateProduct(input: ProductInput) {
  const name = input.name.trim();
  const type = input.type.trim();
  if (!name || !type) throw new Error("Product name and type are required.");
  if (!Number.isInteger(input.salesPrice) || input.salesPrice < 0) {
    throw new Error("Sales price must be a non-negative integer in cents.");
  }
  if (
    input.costPrice !== undefined &&
    input.costPrice !== null &&
    (!Number.isInteger(input.costPrice) || input.costPrice < 0)
  ) {
    throw new Error("Cost price must be a non-negative integer in cents.");
  }
  const variants = (input.variants ?? []).map((variant) => {
    if (!variant.name.trim() || !Number.isInteger(variant.priceDelta)) {
      throw new Error("Each variant needs a name and integer price adjustment.");
    }
    return { ...variant, name: variant.name.trim(), active: variant.active ?? true };
  });
  return {
    ...input,
    name,
    type,
    notes: input.notes?.trim() || null,
    active: input.active ?? true,
    variants,
  };
}
