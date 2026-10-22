import { isReservedOrgSlug } from "@loftlancer/ui/studio-routes";

/** First path segment when the request is under /[org]/… (basePath already stripped). */
export function orgSlugFromRequestPath(
  pathname: string,
  search = "",
): string | null {
  const [first] = pathname.split("/").filter(Boolean);
  if (
    pathname === "/organizations" &&
    first === "organizations" &&
    new URLSearchParams(search).get("directory") === "1"
  ) {
    return null;
  }
  if (!first || isReservedOrgSlug(first)) return null;
  return first;
}
