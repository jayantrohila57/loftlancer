import {
  isEmailAllowedForConsole,
  parseConsoleAllowedEmails,
} from "@loftlancer/t3-env/console";
import { sessionUserIsPlatformAdmin } from "./actions/platform-admin-flag";

type ConsoleAccessUser = {
  id: string;
  email: string;
  role?: string | null;
};

export type ConsoleAccessEvaluation = {
  allowed: boolean;
  reason:
    | "ok"
    | "unauthenticated"
    | "not_platform_admin"
    | "email_not_allowed"
    | "missing_email";
  email: string | null;
  role: string | null;
  allowlistMatch: boolean;
  allowlistSize: number;
};

export function evaluateConsoleOperatorAccess(
  session: { user: ConsoleAccessUser } | null | undefined,
): ConsoleAccessEvaluation {
  if (!session?.user) {
    return {
      allowed: false,
      reason: "unauthenticated",
      email: null,
      role: null,
      allowlistMatch: false,
      allowlistSize: 0,
    };
  }

  const email = session.user.email?.trim() ?? null;
  const role = session.user.role ?? null;
  const allowedEmails = parseConsoleAllowedEmails();
  const platformAdmin = sessionUserIsPlatformAdmin(session.user);

  if (!email) {
    return {
      allowed: false,
      reason: "missing_email",
      email: null,
      role,
      allowlistMatch: false,
      allowlistSize: allowedEmails.length,
    };
  }

  const allowlistMatch = isEmailAllowedForConsole(email, {
    allowedEmails,
  });

  const operatorViaAllowlist =
    allowedEmails.length > 0 && allowlistMatch && !platformAdmin;
  const operatorViaPlatformAdmin = platformAdmin;

  if (!operatorViaPlatformAdmin && !operatorViaAllowlist) {
    return {
      allowed: false,
      reason: platformAdmin ? "email_not_allowed" : "not_platform_admin",
      email,
      role,
      allowlistMatch,
      allowlistSize: allowedEmails.length,
    };
  }

  if (allowedEmails.length > 0 && !allowlistMatch) {
    return {
      allowed: false,
      reason: "email_not_allowed",
      email,
      role,
      allowlistMatch: false,
      allowlistSize: allowedEmails.length,
    };
  }

  return {
    allowed: true,
    reason: "ok",
    email,
    role,
    allowlistMatch,
    allowlistSize: allowedEmails.length,
  };
}

export function logConsoleOperatorAccess(
  evaluation: ConsoleAccessEvaluation,
  context: { surface: "page" | "trpc" },
): void {
  if (evaluation.allowed) {
    return;
  }
  console.warn(
    JSON.stringify({
      type: "console-operator-access",
      surface: context.surface,
      reason: evaluation.reason,
      email: evaluation.email,
      role: evaluation.role,
      allowlistSize: evaluation.allowlistSize,
      allowlistMatch: evaluation.allowlistMatch,
    }),
  );
}
