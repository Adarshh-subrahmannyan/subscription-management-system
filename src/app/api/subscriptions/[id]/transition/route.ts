import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { transitionSubscription, type SubscriptionStatus } from "@/modules/subscriptions";
import { authError, forbiddenError } from "@/lib/errors";
import { validateSubscriptionStatus } from "@/modules/subscriptions/subscription.validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: authError().message }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return NextResponse.json({ error: forbiddenError("Admin or staff access required.").message }, { status: 403 });
  }
  let body: { status?: unknown };
  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!validateSubscriptionStatus(body.status) || body.status === "draft" || body.status === "quotation") {
    return NextResponse.json({ error: "Invalid subscription transition status." }, { status: 400 });
  }
  const { id } = await context.params;
  try {
    return NextResponse.json(
      await transitionSubscription(session.user.role, id, body.status as SubscriptionStatus),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to transition subscription.";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
