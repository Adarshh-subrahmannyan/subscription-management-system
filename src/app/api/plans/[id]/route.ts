import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPlan, updatePlan, type PlanInput } from "@/modules/plans";
import { failure, success, readJson } from "@/lib/api-response";
import { authError, forbiddenError } from "@/lib/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  const { id } = await context.params;
  const plan = await getPlan(id);
  if (!plan) return failure(new Error("Plan not found."));
  return success(plan);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  if (session?.user.role !== "admin") {
    return failure(forbiddenError("Admin access required."));
  }

  try {
    const { id } = await context.params;
    return success(await updatePlan("admin", id, await readJson<PlanInput>(request)));
  } catch (error) {
    return failure(error, "Unable to update plan.");
  }
}
