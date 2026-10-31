import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPlan, listPlans, type PlanInput } from "@/modules/plans";
import { failure, success, created, readJson } from "@/lib/api-response";
import { authError, forbiddenError } from "@/lib/errors";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  const { searchParams } = new URL(request.url);
  return success(await listPlans({
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 20),
  }));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  if (session?.user.role !== "admin") {
    return failure(forbiddenError("Admin access required."));
  }

  try {
    return created(await createPlan("admin", await readJson<PlanInput>(request)));
  } catch (error) {
    return failure(error, "Unable to create plan.");
  }
}
