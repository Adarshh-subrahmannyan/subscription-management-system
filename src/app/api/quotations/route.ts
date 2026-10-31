import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createQuotation, listQuotations, type QuotationInput } from "@/modules/quotations";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
  return NextResponse.json(await listQuotations(session.user.role, session.user.customerId, page));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    return NextResponse.json({ error: "Admin or staff access required." }, { status: 403 });
  }
  try {
    return NextResponse.json(
      await createQuotation(
        session.user.role,
        session.user.id,
        (await request.json()) as QuotationInput,
      ),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create quotation.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
