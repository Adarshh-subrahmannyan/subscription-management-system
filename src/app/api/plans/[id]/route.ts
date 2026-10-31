import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getPlan, updatePlan, type PlanInput } from "@/modules/plans";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const plan = await getPlan(id);
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    return NextResponse.json(
      await updatePlan("admin", id, (await request.json()) as PlanInput),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update plan.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
