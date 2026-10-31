import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCustomer, listCustomers, type CustomerInput } from "@/modules/customers";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const searchParams = new URL(request.url).searchParams;
  return NextResponse.json(
    await listCustomers(session.user.role, session.user.customerId, {
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
      search: searchParams.get("search") ?? undefined,
    }),
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    return NextResponse.json(
      await createCustomer(session.user.role, (await request.json()) as CustomerInput),
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create customer.";
    const status = message.includes("required") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
