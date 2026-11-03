import { TRPCError } from "@trpc/server";
import { sessionUserIsPlatformAdmin } from "./actions/platform-admin-flag";
import {
  evaluateConsoleOperatorAccess,
  logConsoleOperatorAccess,
} from "./console-operator-access";

type SessionPayload = {
  user: { id: string; email: string; role?: string | null };
};

export function assertConsoleOperator(
  session: SessionPayload,
  options: { surface?: "page" | "trpc" } = {},
): void {
  const evaluation = evaluateConsoleOperatorAccess(session);
  if (!evaluation.allowed) {
    logConsoleOperatorAccess(evaluation, {
      surface: options.surface ?? "trpc",
    });
    const message =
      evaluation.reason === "not_platform_admin"
        ? "Platform admin role required"
        : evaluation.reason === "email_not_allowed"
          ? "Console access is restricted to authorized operators"
          : "Console access denied";
    throw new TRPCError({
      code: "FORBIDDEN",
      message,
    });
  }
}

export function isConsoleOperator(session: SessionPayload | null): boolean {
  return evaluateConsoleOperatorAccess(session).allowed;
}

export function getPlatformAdminFromSession(
  session: SessionPayload | null | undefined,
): boolean {
  return sessionUserIsPlatformAdmin(session?.user);
}
