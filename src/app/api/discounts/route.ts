import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authError, forbiddenError } from "@/lib/errors";
import {
  getAllDiscounts,
  createDiscount,
} from "@/modules/discounts";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return NextResponse.json({ error: forbiddenError("Admin or staff access required.").message }, { status: 403 });
  }

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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: forbiddenError("Admin access required.").message }, { status: 403 });
  }

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