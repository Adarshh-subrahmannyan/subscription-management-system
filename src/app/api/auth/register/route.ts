import { NextResponse } from "next/server";
import { registerCustomer } from "@/modules/auth/auth.service";

type RegistrationBody = {
  email?: unknown;
  name?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: RegistrationBody;

  try {
    body = (await request.json()) as RegistrationBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (
    typeof body.email !== "string" ||
    typeof body.name !== "string" ||
    typeof body.password !== "string" ||
    !body.email.trim() ||
    !body.name.trim()
  ) {
    return NextResponse.json(
      { error: "Email, name, and password are required." },
      { status: 400 },
    );
  }

  try {
    const user = await registerCustomer({
      email: body.email,
      name: body.name,
      password: body.password,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed.";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
