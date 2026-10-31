import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getQuotation } from "@/modules/quotations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { id } = await context.params;
  const quotation = await getQuotation(session.user.role, session.user.customerId, id);
  if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  return NextResponse.json(quotation);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    return NextResponse.json({ error: "Admin or staff access required." }, { status: 403 });
  }

  const { id } = await context.params;
  let body: { status?: unknown };
  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!["sent", "accepted", "rejected"].includes(String(body.status))) {
    return NextResponse.json({ error: "Invalid quotation status." }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) return NextResponse.json({ error: "Quotation not found." }, { status: 404 });
  if (quotation.status !== "draft" && body.status !== "expired") {
    return NextResponse.json({ error: "Quotation status cannot be changed." }, { status: 400 });
  }
  const updated = await prisma.quotation.update({
    where: { id },
    data: { status: body.status as string },
  });
  return NextResponse.json(updated);
}
