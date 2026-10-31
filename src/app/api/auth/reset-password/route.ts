import { NextResponse } from "next/server";
import { resetPassword } from "@/modules/auth/auth.service";

export async function POST(request: Request) {
  let body: { token?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { token?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.token !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
  }

  try {
    await resetPassword(body.token, body.password);
    return NextResponse.json({ message: "Password reset successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reset password.";
    const status = message.includes("invalid or expired") ? 400 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
