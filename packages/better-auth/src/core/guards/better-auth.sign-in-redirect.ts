import {
  absoluteReturnToFromRelativePath,
  validateReturnTo,
} from "../../utils/better-auth.return-to";
import { buildLandingUrl } from "../better-auth.platform-middleware";

export type SignInRedirectMode = "platform" | "legacy";

export type SignInRedirectOptions = {
  appOrigin: string;
  returnPath: string;
  mode?: SignInRedirectMode;
};

/** Signed-out (#302): no sign-in screen or return_to; land on the site root. */
export function buildPlatformSignInRedirectUrl(
  options: SignInRedirectOptions,
): string {
  return buildLandingUrl(options.appOrigin);
}

/** Legacy web host: relative `/sign-in?redirect=…`. */
export function buildLegacySignInRedirectPath(returnPath: string): string {
  const path =
    returnPath.startsWith("/") && !returnPath.startsWith("//")
      ? returnPath
      : "/";
  return `/sign-in?redirect=${encodeURIComponent(path)}`;
}

export function resolveSignInRedirect(options: SignInRedirectOptions): string {
  const mode = options.mode ?? "platform";
  if (mode === "legacy") {
    return buildLegacySignInRedirectPath(options.returnPath);
  }
  return buildPlatformSignInRedirectUrl(options);
}

/** Banned users are sent to the landing; the session is rejected server-side. */
export function buildBannedUserSignOutUrl(options: {
  appOrigin: string;
  mode?: SignInRedirectMode;
}): string {
  if ((options.mode ?? "platform") === "legacy") {
    return `/api/better-auth/sign-out?callbackUrl=${encodeURIComponent("/")}`;
  }
  return buildPlatformSignInRedirectUrl({
    appOrigin: options.appOrigin,
    returnPath: "/",
  });
}

export function absoluteReturnPath(
  appOrigin: string,
  returnPath: string,
): string {
  return (
    absoluteReturnToFromRelativePath(returnPath, appOrigin) ??
    validateReturnTo(null)
  );
}
