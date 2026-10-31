import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { convertQuotationToSubscription } from "@/modules/subscriptions";
import { authError, forbiddenError } from "@/lib/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: authError().message }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return NextResponse.json({ error: forbiddenError("Admin or staff access required.").message }, { status: 403 });
  }

  let body: { startDate?: unknown };
  try {
    body = (await request.json()) as { startDate?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (typeof body.startDate !== "string") {
    return NextResponse.json({ error: "Start date is required." }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    return NextResponse.json(
      await convertQuotationToSubscription(session.user.role, id, body.startDate),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to convert quotation.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
