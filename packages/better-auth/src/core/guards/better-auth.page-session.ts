import type { AuthSession } from "../../types/better-auth.session-types";
import { evaluateSessionAccess } from "./better-auth.session-access";
import {
  buildBannedUserSignOutUrl,
  resolveSignInRedirect,
  type SignInRedirectOptions,
} from "./better-auth.sign-in-redirect";

export type PageSessionRedirect = {
  kind: "redirect";
  url: string;
};

export type RequirePageSessionResult =
  | { ok: true; session: AuthSession }
  | PageSessionRedirect;

/**
 * Pure session gate for RSC layouts/pages (no Next.js imports).
 * Callers should `redirect(result.url)` when `kind === "redirect"`.
 */
export function requirePageSession(
  session: AuthSession | null | undefined,
  options: SignInRedirectOptions,
): RequirePageSessionResult {
  const access = evaluateSessionAccess(session);

  if (access.status === "unauthenticated" || access.status === "deleted_user") {
    return {
      kind: "redirect",
      url: resolveSignInRedirect(options),
    };
  }

  if (access.status === "banned") {
    return {
      kind: "redirect",
      url: buildBannedUserSignOutUrl({
        appOrigin: options.appOrigin,
        mode: options.mode,
      }),
    };
  }

  return { ok: true, session: access.session };
}
