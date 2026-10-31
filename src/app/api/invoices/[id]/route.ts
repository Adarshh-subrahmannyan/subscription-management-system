import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getInvoice } from "@/modules/invoices";
import { prisma } from "@/lib/prisma";
import { authError, forbiddenError } from "@/lib/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: authError().message }, { status: 401 });
  }

  const { id } = await context.params;
  const invoice = await getInvoice(session.user.role, session.user.customerId, id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  return NextResponse.json({ data: invoice });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: authError().message }, { status: 401 });
  }

  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return NextResponse.json({ error: forbiddenError("Admin or staff access required.").message }, { status: 403 });
  }

  const { id } = await context.params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  try {
    const body = (await request.json()) as { status?: string };
    if (!body.status) {
      return NextResponse.json({ error: "status is required." }, { status: 400 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: body.status },
      include: {
        customer: true,
        subscription: { include: { plan: true } },
        lines: { include: { product: true } },
        payments: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update invoice.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
