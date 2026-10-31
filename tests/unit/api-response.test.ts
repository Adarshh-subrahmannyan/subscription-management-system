import { AppError, authError, notFoundError } from "../../src/lib/errors";

const unauthorized = authError();
if (!(unauthorized instanceof AppError) || unauthorized.code !== "UNAUTHORIZED") {
  throw new Error("Authentication errors were not classified.");
}

if (notFoundError("Customer").code !== "NOT_FOUND") {
  throw new Error("Not-found errors were not classified.");
}

console.log("API response error classification test passed!");
