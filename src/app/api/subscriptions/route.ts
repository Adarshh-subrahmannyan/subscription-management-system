import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listSubscriptions } from "@/modules/subscriptions";
import { authError } from "@/lib/errors";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: authError().message }, { status: 401 });
  const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
  return NextResponse.json(await listSubscriptions(session.user.role, session.user.customerId, page));
}
