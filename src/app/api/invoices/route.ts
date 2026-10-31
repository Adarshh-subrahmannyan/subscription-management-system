import { NextResponse } from "next/server";
import {
  createInvoice,
  getAllInvoices,
} from "@/modules/invoices/invoice.service";

export async function GET() {
  return NextResponse.json(getAllInvoices());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const invoice = createInvoice(
      body.customerId,
      body.items
    );

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create invoice",
      },
      { status: 400 }
    );
  }
}