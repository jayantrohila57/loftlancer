import type { AuthSession } from "../../types/better-auth.session-types";

export type SessionAccessStatus =
  | "ok"
  | "unauthenticated"
  | "banned"
  | "deleted_user";

export type SessionAccessResult =
  | { status: "ok"; session: AuthSession }
  | { status: "unauthenticated" }
  | { status: "banned"; reason: string | null }
  | { status: "deleted_user" };

type SessionUser = AuthSession["user"] & {
  banned?: boolean;
  banReason?: string | null;
  deletedAt?: Date | string | null;
};

export function evaluateSessionAccess(
  session: AuthSession | null | undefined,
): SessionAccessResult {
  if (!session?.user) {
    return { status: "unauthenticated" };
  }

  const user = session.user as SessionUser;
  if (user.deletedAt) {
    return { status: "deleted_user" };
  }
  if (user.banned) {
    return { status: "banned", reason: user.banReason ?? null };
  }

  return { status: "ok", session };
}
