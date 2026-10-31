import { AppError, authError, notFoundError } from "../../src/lib/errors";
import { failure } from "../../src/lib/api-response";

const unauthorized = authError();
if (!(unauthorized instanceof AppError) || unauthorized.code !== "UNAUTHORIZED") {
  throw new Error("Authentication errors were not classified.");
}

if (notFoundError("Customer").code !== "NOT_FOUND") {
  throw new Error("Not-found errors were not classified.");
}

console.log("API response error classification test passed!");

async function verifyUnauthorizedResponse() {
  const response = failure(authError());
  const body = (await response.json()) as { error?: { code?: string } };
  if (response.status !== 401 || body.error?.code !== "UNAUTHORIZED") {
    throw new Error("Unauthorized API response was not standardized.");
  }
}

verifyUnauthorizedResponse().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
