import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSubscription, listSubscriptions, type CreateSubscriptionInput } from "@/modules/subscriptions";
import { authError, forbiddenError } from "@/lib/errors";
import { created, failure, readJson, success } from "@/lib/api-response";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
  try {
    return success(await listSubscriptions(session.user.role, session.user.customerId, page));
  } catch (error) {
    return failure(error, "Unable to load subscriptions.");
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return failure(forbiddenError("Admin or staff access required."));
  }
  try {
    return created(await createSubscription(
      session.user.role,
      await readJson<CreateSubscriptionInput>(request),
    ));
  } catch (error) {
    return failure(error, "Unable to create subscription.");
  }
}
