import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProduct, updateProduct, type ProductInput } from "@/modules/products";
import { failure, success, readJson } from "@/lib/api-response";
import { authError, forbiddenError } from "@/lib/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  const { id } = await context.params;
  const product = await getProduct(id);
  if (!product) return failure(new Error("Product not found."));
  return success(product);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  if (session?.user.role !== "admin") {
    return failure(forbiddenError("Admin access required."));
  }

  try {
    const { id } = await context.params;
    const input = await readJson<ProductInput>(request);
    return success(await updateProduct("admin", id, input));
  } catch (error) {
    return failure(error, "Unable to update product.");
  }
}
