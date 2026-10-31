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

  const where =
    session.user.role === "customer"
      ? { invoice: { customerId: session.user.customerId ?? "__none__" } }
      : undefined;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { paidAt: "desc" },
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
            customer: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({ data: payments, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: authError().message }, { status: 401 });
  }

  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return NextResponse.json({ error: "Admin or staff access required." }, { status: 403 });
  }

  try {
    const body = await request.json() as {
      invoiceId?: string;
      amount?: number;
      method?: string;
      reference?: string;
      note?: string;
    };

    if (!body.invoiceId || !body.amount || !body.method) {
      return NextResponse.json({ error: "invoiceId, amount and method are required." }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: body.invoiceId } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          invoiceId: body.invoiceId!,
          amount: body.amount!,
          method: body.method!,
          reference: body.reference ?? null,
          note: body.note ?? null,
          paidAt: new Date(),
        },
      });

      // Update invoice paid amount
      const newPaidAmount = invoice.paidAmount + body.amount!;
      const newStatus =
        newPaidAmount >= invoice.total
          ? "paid"
          : newPaidAmount > 0
            ? "partial"
            : invoice.status;

      await tx.invoice.update({
        where: { id: body.invoiceId },
        data: { paidAmount: newPaidAmount, status: newStatus },
      });

      return newPayment;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record payment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
