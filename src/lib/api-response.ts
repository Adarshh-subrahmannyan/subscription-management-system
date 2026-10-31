import { NextResponse } from "next/server";
import { getErrorResponse } from "./errors";

const statusByCode = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T) {
  return success(data, 201);
}

export function failure(error: unknown, fallback?: string) {
  const parsed = getErrorResponse(error, fallback);
  return NextResponse.json(
    { error: { code: parsed.code, message: parsed.message } },
    { status: statusByCode[parsed.code] },
  );
}

export async function readJson<T>(request: Request) {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}
