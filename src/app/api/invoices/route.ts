import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authError, forbiddenError } from "@/lib/errors";
import {
  createInvoice,
  getAllInvoices,
  markInvoicePaid,
} from "@/modules/invoices/invoice.service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });

  try {
    const invoices = await getAllInvoices();
    const visibleInvoices = session.user.role === "customer"
      ? invoices.filter((invoice) => invoice.customerId === session.user.customerId)
      : invoices;
    return NextResponse.json(visibleInvoices);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return NextResponse.json({ error: forbiddenError("Admin or staff access required.").message }, { status: 403 });
  }

  try {
    const body = await request.json();

    const invoice = await createInvoice(
      body.customerId,
      body.items,
      body.billingPeriod
    );

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create invoice" },
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

    const invoice = await markInvoicePaid(body.invoiceId);

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update invoice" },
      { status: 400 }
    );
  }
}