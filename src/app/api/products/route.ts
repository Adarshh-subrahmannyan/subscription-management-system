import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createProduct, listProducts, type ProductInput } from "@/modules/products";
import { failure, created, success, readJson } from "@/lib/api-response";
import { forbiddenError } from "@/lib/errors";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const products = await listProducts({
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 20),
  });
  return success(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    return failure(forbiddenError("Admin access required."));
  }

  try {
    return created(await createProduct("admin", await readJson<ProductInput>(request)));
  } catch (error) {
    return failure(error, "Unable to create product.");
  }
}
