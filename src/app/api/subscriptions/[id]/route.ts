import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSubscription } from "@/modules/subscriptions";
import { authError } from "@/lib/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });
  const { id } = await context.params;
  const subscription = await getSubscription(session.user.role, session.user.customerId, id);
  if (!subscription) return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
  return NextResponse.json(subscription);
}
