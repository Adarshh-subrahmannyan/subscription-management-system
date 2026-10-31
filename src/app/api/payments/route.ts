import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authError, forbiddenError } from "@/lib/errors";
import {
  createPayment,
  getAllPayments,
  simulatePayment,
} from "@/modules/payments/payment.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });

  try {
    const payments = await getAllPayments();
    const visiblePayments = session.user.role === "customer"
      ? payments.filter((payment) => payment.invoice.customerId === session.user.customerId)
      : payments;
    return NextResponse.json(visiblePayments);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });

  try {
    const body = await request.json();
    if (session.user.role === "customer") {
      const invoice = await prisma.invoice.findUnique({
        where: { id: body.invoiceId },
        select: { customerId: true },
      });
      if (!invoice || invoice.customerId !== session.user.customerId) {
        return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
      }
    } else if (session.user.role !== "admin" && session.user.role !== "staff") {
      return NextResponse.json({ error: forbiddenError("Admin or staff access required.").message }, { status: 403 });
    }

    if (!["card", "upi", "bank_transfer"].includes(body.method)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const payment = await createPayment(
      body.invoiceId,
      body.amount,
      body.method
    );

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create payment" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return NextResponse.json({ error: forbiddenError("Admin or staff access required.").message }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (!["success", "failure"].includes(body.outcome)) {
      return NextResponse.json(
        { error: "Outcome must be success or failure" },
        { status: 400 }
      );
    }

    const payment = await simulatePayment(
      body.paymentId,
      body.outcome
    );

    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process payment" },
      { status: 400 }
    );
  }
}