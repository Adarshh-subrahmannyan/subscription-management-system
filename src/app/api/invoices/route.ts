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
  const search = searchParams.get("search")?.trim();

  const where =
    session.user.role === "customer"
      ? { customerId: session.user.customerId ?? "__none__" }
      : search
        ? {
            OR: [
              { number: { contains: search } },
              { customer: { name: { contains: search } } },
            ],
          }
        : undefined;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        payments: { select: { id: true, amount: true, paidAt: true, method: true } },
        _count: { select: { lines: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({ data: invoices, total, page, pageSize });
}