import { NextResponse } from "next/server";
import {
  createInvoice,
  getAllInvoices,
  markInvoicePaid,
} from "@/modules/invoices/invoice.service";

export async function GET() {
  try {
    const invoices = await getAllInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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