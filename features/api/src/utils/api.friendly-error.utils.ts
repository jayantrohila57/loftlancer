import { TRPCError } from "@trpc/server";
import { ZodError } from "zod/v3";

const RAW_DB_PATTERNS = [
  /failed query/i,
  /insert into/i,
  /update "/i,
  /delete from/i,
  /select .+ from/i,
  /violates unique constraint/i,
  /duplicate key/i,
  /encrypted_value/i,
  /params:/i,
  /relation .+ does not exist/i,
  /column .+ does not exist/i,
  /organization_id/i,
  /user_id/i,
  /active_organization/i,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
];

function isPostgresUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "23505";
}

function formatZodIssue(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) {
    return "Please check your input and try again.";
  }

  const field = issue.path[0];
  if (issue.code === "invalid_string" && issue.validation === "uuid") {
    if (field === "environmentId") {
      return "This environment is not ready yet. Wait a moment and try again.";
    }
    if (field === "projectId") {
      return "Project not found. Refresh the page and try again.";
    }
    return "Invalid identifier. Refresh the page and try again.";
  }

  return issue.message;
}

function tryParseSerializedZodIssues(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0] as {
        message?: string;
        path?: (string | number)[];
      };
      if (first?.message) {
        if (
          first.message === "Invalid uuid" &&
          first.path?.includes("environmentId")
        ) {
          return "This environment is not ready yet. Wait a moment and try again.";
        }
        return first.message;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof TRPCError) {
    const fromMessage = tryParseSerializedZodIssues(error.message);
    if (fromMessage) return fromMessage;
    if (RAW_DB_PATTERNS.some((pattern) => pattern.test(error.message))) {
      return fallback;
    }
    return error.message;
  }

  if (error instanceof ZodError) {
    return formatZodIssue(error);
  }

  if (isPostgresUniqueViolation(error)) {
    return "A project with this name already exists. Try a different name.";
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const fromSerialized = message ? tryParseSerializedZodIssues(message) : null;
  if (fromSerialized) {
    return fromSerialized;
  }

  if (!message || RAW_DB_PATTERNS.some((pattern) => pattern.test(message))) {
    return fallback;
  }

  return message;
}

export function throwFriendlyError(
  error: unknown,
  options: { fallback: string; code?: TRPCError["code"] },
): never {
  throw new TRPCError({
    code: options.code ?? "INTERNAL_SERVER_ERROR",
    message: getFriendlyErrorMessage(error, options.fallback),
    cause: error,
  });
}
