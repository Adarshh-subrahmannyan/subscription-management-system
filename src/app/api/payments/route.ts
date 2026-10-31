import { NextResponse } from "next/server";
import {
  createPayment,
  savePayment,
  getPayment,
  getAllPayments,
  simulatePayment,
} from "@/modules/payments/payment.service";

import { markInvoicePaid } from "@/modules/invoices/invoice.service";

// Get all payments
export async function GET() {
  return NextResponse.json(getAllPayments());
}

// Create a new payment
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payment = createPayment(
      body.invoiceId,
      body.amount,
      body.method
    );

    savePayment(payment);

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create payment",
      },
      { status: 400 }
    );
  }
}

// Simulate payment success or failure
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const payment = getPayment(body.paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

   const updatedPayment = simulatePayment(
  payment,
  body.outcome
);

savePayment(updatedPayment);

// Update invoice when payment succeeds
if (updatedPayment.status === "completed") {
  markInvoicePaid(updatedPayment.invoiceId);
}

return NextResponse.json(updatedPayment);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to process payment",
      },
      { status: 400 }
    );
  }
}