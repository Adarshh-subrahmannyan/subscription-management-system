import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { failure, success } from "@/lib/api-response";
import { authError, forbiddenError } from "@/lib/errors";
import { getBillingAnalytics } from "@/modules/analytics";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return failure(authError());
  if (session.user.role !== "admin" && session.user.role !== "staff") {
    return failure(forbiddenError("Admin or staff access required."));
  }

  try {
    const analytics = await getBillingAnalytics();
    return success(analytics);
  } catch (error) {
    return failure(error, "Failed to fetch analytics.");
  }
}