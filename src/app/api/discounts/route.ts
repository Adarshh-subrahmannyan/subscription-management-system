import { NextResponse } from "next/server";
import {
  getAllDiscounts,
  createDiscount,
} from "@/modules/discounts";

export async function GET() {
  try {
    return NextResponse.json(await getAllDiscounts());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const discount = await createDiscount(body);
    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create discount" },
      { status: 400 }
    );
  }
}