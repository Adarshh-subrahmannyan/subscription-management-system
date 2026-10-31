import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscription } from "@/modules/subscriptions";
import { authError, forbiddenError } from "@/lib/errors";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 20;

  const where =
    session.user.role === "customer"
      ? { customerId: session.user.customerId ?? "__none__" }
      : undefined;

  const [data, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true, billingFrequency: true, price: true } },
        lines: { select: { quantity: true, amount: true } },
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });

  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return NextResponse.json(
      { error: forbiddenError("Admin or staff access required.").message },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    if (!body.customerId || !body.planId || !body.startDate) {
      return NextResponse.json(
        { error: "customerId, planId, and startDate are required." },
        { status: 400 }
      );
    }

    const sub = await createSubscription(session.user.role, {
      customerId: body.customerId,
      planId: body.planId,
      startDate: body.startDate,
      paymentTerms: body.paymentTerms,
    });

    return NextResponse.json({ data: sub }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create subscription.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
