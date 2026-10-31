import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  deactivateCustomer,
  getCustomer,
  updateCustomer,
  type CustomerInput,
} from "@/modules/customers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { id } = await context.params;
  const customer = await getCustomer(session.user.role, session.user.customerId, id);
  if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const customer = await updateCustomer(
      session.user.role,
      session.user.customerId,
      id,
      (await request.json()) as CustomerInput,
    );
    return NextResponse.json(customer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update customer.";
    const status = message.includes("not found") ? 404 : message.includes("required") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    return NextResponse.json(await deactivateCustomer(session.user.role, id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to deactivate customer.";
    const status = message.includes("not found") ? 404 : 403;
    return NextResponse.json({ error: message }, { status });
  }
}
