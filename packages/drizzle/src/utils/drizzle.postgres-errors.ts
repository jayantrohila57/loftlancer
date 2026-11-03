import { logger } from "@loftlancer/sentry";

let loggedSchemaOutOfDate = false;

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }
  return typeof error === "string" ? error : "";
}

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

export function unwrapDatabaseError(error: unknown): unknown {
  if (!error || typeof error !== "object") {
    return error;
  }
  const withCause = error as { cause?: unknown; code?: string };
  if (withCause.code === "42703") {
    return error;
  }
  if (withCause.cause !== undefined && withCause.cause !== error) {
    const inner = unwrapDatabaseError(withCause.cause);
    if (isPostgresMissingColumnError(inner)) {
      return inner;
    }
  }
  return error;
}

export function isPostgresMissingColumnError(error: unknown): boolean {
  const root = unwrapDatabaseError(error);
  if (errorCode(root) === "42703") {
    return true;
  }
  const message = errorMessage(root).toLowerCase();
  return message.includes("column") && message.includes("does not exist");
}

/**
 * Log a single clear hint when the DB schema lags application code (missing column).
 */
export function logSchemaOutOfDateOnce(
  error: unknown,
  context?: string,
): boolean {
  if (!isPostgresMissingColumnError(error)) {
    return false;
  }
  if (loggedSchemaOutOfDate) {
    return true;
  }
  loggedSchemaOutOfDate = true;
  logger.exception(
    "database schema out of date, run migrations",
    unwrapDatabaseError(error),
    { context },
  );
  return true;
}
