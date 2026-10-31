import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCustomer, listCustomers, type CustomerInput } from "@/modules/customers";
import { authError, forbiddenError } from "@/lib/errors";
import { created, failure, readJson, success } from "@/lib/api-response";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return failure(authError());
  }
  const searchParams = new URL(request.url).searchParams;
  return success(
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
    return failure(authError());
  }
  try {
    return created(await createCustomer(session.user.role, await readJson<CustomerInput>(request)));
  } catch (error) {
    return failure(
      error instanceof Error && error.message === "Admin or staff access required."
        ? forbiddenError(error.message)
        : error,
      "Unable to create customer.",
    );
  }
}
