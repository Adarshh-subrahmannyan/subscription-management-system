import { NextResponse } from "next/server";
import { createPayment } from "@/modules/payments/payment.service";

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payment = createPayment(
      body.invoiceId,
      body.amount,
      body.method
    );

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