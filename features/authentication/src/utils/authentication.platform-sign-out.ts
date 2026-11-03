import type { PlatformSignOutOptions } from "../types/authentication.platform-sign-out.types";
import { landingUrl } from "./authentication.auth-links";

export type { PlatformSignOutOptions };

/**
 * End the Loftlancer session (#302): no sign-out screen. Called from the
 * shared confirm dialog. Studio, auth and docs share one origin, so revoking
 * the session here signs out everywhere; then land on the public site.
 */
export async function performPlatformSignOut(
  options: PlatformSignOutOptions = {},
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }
  options.onClearClient?.();
  if (options.signOutLocal) {
    try {
      await options.signOutLocal();
    } catch {
      // Still leave the app; the session cookie is cleared server-side on retry.
    }
  }
  window.location.assign(options.returnTo ?? landingUrl());
}
