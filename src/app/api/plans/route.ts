import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPlan, listPlans, type PlanInput } from "@/modules/plans";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json(await listPlans({
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 20),
  }));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    return NextResponse.json(
      await createPlan("admin", (await request.json()) as PlanInput),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create plan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
