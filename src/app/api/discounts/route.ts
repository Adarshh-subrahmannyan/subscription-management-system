import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authError } from "@/lib/errors";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: authError().message }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 20;

  const [discounts, total] = await Promise.all([
    prisma.discount.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.discount.count(),
  ]);

  return NextResponse.json({ data: discounts, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: authError().message }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json() as {
      name?: string;
      kind?: string;
      value?: number;
      minimumPurchase?: number | null;
      minimumQuantity?: number | null;
      startsAt?: string | null;
      endsAt?: string | null;
      usageLimit?: number | null;
      active?: boolean;
    };

    if (!body.name?.trim() || !body.kind || body.value === undefined) {
      return NextResponse.json({ error: "name, kind, and value are required." }, { status: 400 });
    }

    const discount = await prisma.discount.create({
      data: {
        name: body.name.trim(),
        kind: body.kind,
        value: body.value,
        minimumPurchase: body.minimumPurchase ?? null,
        minimumQuantity: body.minimumQuantity ?? null,
        startsAt: body.startsAt ? new Date(body.startsAt) : null,
        endsAt: body.endsAt ? new Date(body.endsAt) : null,
        usageLimit: body.usageLimit ?? null,
        active: body.active ?? true,
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create discount.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
