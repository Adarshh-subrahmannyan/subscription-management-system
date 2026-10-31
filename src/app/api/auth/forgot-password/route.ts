import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/modules/auth/auth.service";

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.email !== "string" || !body.email.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const reset = await requestPasswordReset(body.email);
  const response: { message: string; demoResetToken?: string; expiresAt?: string } = {
    message: "If an account exists for that email, reset instructions have been prepared.",
  };

  if (reset && process.env.NODE_ENV !== "production") {
    response.demoResetToken = reset.token;
    response.expiresAt = reset.expiresAt.toISOString();
  }

  return NextResponse.json(response);
}
