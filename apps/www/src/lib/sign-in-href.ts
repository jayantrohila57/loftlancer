import { resolveAuthAppOrigin, studioHomeUrl } from "@loftlancer/ui/auth-links";

export function getSignInHref(
  authOrigin = resolveAuthAppOrigin(),
  studioUrl = studioHomeUrl(),
): string {
  const base = authOrigin.endsWith("/") ? authOrigin : `${authOrigin}/`;
  const href = new URL("api/sign-in/github", base);
  href.searchParams.set("return_to", studioUrl);
  return href.toString();
}
