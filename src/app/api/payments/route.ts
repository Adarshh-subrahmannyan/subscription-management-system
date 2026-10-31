import { NextResponse } from "next/server";
import {
  createPayment,
  getAllPayments,
  simulatePayment,
} from "@/modules/payments/payment.service";

export async function GET() {
  try {
    const payments = await getAllPayments();
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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