import { trimTrailingSlash } from "../config/better-auth.platform-urls";

const OTT_QUERY = "ott";

export function appendOttToUrl(targetUrl: string, token: string): string {
  const url = new URL(targetUrl);
  url.searchParams.set(OTT_QUERY, token);
  return url.toString();
}

export function readOttFromSearchParams(
  searchParams: URLSearchParams,
): string | null {
  const value = searchParams.get(OTT_QUERY);
  return value?.trim() ? value.trim() : null;
}

export function stripOttFromPath(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  params.delete(OTT_QUERY);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function isCrossOriginReturnTo(
  returnTo: string,
  authOrigin: string,
): boolean {
  try {
    const target = new URL(returnTo);
    // authOrigin may carry the auth app path (e.g. https://loftlancer.com/auth).
    return target.origin !== new URL(trimTrailingSlash(authOrigin)).origin;
  } catch {
    return false;
  }
}
