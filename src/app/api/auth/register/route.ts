import { registerCustomer } from "@/modules/auth/auth.service";
import { created, failure, readJson } from "@/lib/api-response";

type RegistrationBody = {
  email?: unknown;
  name?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: RegistrationBody;

  try {
    body = await readJson<RegistrationBody>(request);
  } catch {
    return failure(new Error("Request body must be valid JSON."));
  }

  if (
    typeof body.email !== "string" ||
    typeof body.name !== "string" ||
    typeof body.password !== "string" ||
    !body.email.trim() ||
    !body.name.trim()
  ) {
    return failure(new Error("Email, name, and password are required."));
  }

  try {
    const user = await registerCustomer({
      email: body.email,
      name: body.name,
      password: body.password,
    });

    return created(user);
  } catch (error) {
    return failure(error, "Registration failed.");
  }
}
