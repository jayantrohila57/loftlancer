const ORGANIZATION_SECTIONS = new Set([
  "projects",
  "members",
  "teams",
  "invitations",
  "roles",
  "activity",
  "settings",
]);

/**
 * Organization chrome owns organization routes. Project routes are nested in
 * the app router, but must render only their own resource shell.
 */
export function isOrganizationShellRoute(
  pathname: string,
  slug: string,
  basePath = "",
): boolean {
  const normalizedBasePath = basePath.replace(/\/$/, "");
  const routePath =
    normalizedBasePath &&
    (pathname === normalizedBasePath ||
      pathname.startsWith(`${normalizedBasePath}/`))
      ? pathname.slice(normalizedBasePath.length)
      : pathname;
  const segments = routePath.split("/").filter(Boolean);
  const orgIndex = segments.findIndex((segment) => {
    try {
      return decodeURIComponent(segment) === slug;
    } catch {
      return segment === slug;
    }
  });

  if (orgIndex < 0 || orgIndex === segments.length - 1) return true;
  if (segments[orgIndex + 1] === "teams" && segments[orgIndex + 2]) {
    return false;
  }
  return ORGANIZATION_SECTIONS.has(segments[orgIndex + 1] ?? "");
}
