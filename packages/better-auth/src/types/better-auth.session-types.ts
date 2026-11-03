import type { auth } from "../core/better-auth";

/** Better Auth session payload from `auth.api.getSession` (includes plugin fields at runtime). */
export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export function getSessionActiveOrganizationId(
  payload: AuthSession,
): string | null {
  const session = payload.session as AuthSession["session"] & {
    activeOrganizationId?: string | null;
  };
  return session.activeOrganizationId ?? null;
}
