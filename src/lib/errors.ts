export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const authError = (message = "Authentication required.") =>
  new AppError(message, "UNAUTHORIZED");
export const forbiddenError = (message = "You do not have permission to perform this action.") =>
  new AppError(message, "FORBIDDEN");
export const notFoundError = (resource: string) =>
  new AppError(`${resource} not found.`, "NOT_FOUND");
export const conflictError = (message: string) => new AppError(message, "CONFLICT");

export function getErrorResponse(error: unknown, fallback = "Request failed.") {
  if (error instanceof AppError) return { message: error.message, code: error.code };
  if (error instanceof Error) return { message: error.message, code: "BAD_REQUEST" as const };
  console.error("Unhandled API error", error);
  return { message: fallback, code: "INTERNAL_SERVER_ERROR" as const };
}
