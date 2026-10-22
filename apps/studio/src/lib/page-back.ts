import {
  isReservedOrgSlug,
  isReservedProjectSlug,
} from "@loftlancer/ui/studio-routes";
import type { Route } from "next";

export type PageBackHref = Route;

/** Top-level list routes: no inline back (browser history only). */
const HISTORY_ROOT_PATHS = new Set<string>([
  "/",
  "/organizations",
  "/notifications",
  "/activity",
  "/support",
]);

export function isDashboardRootPath(pathname: string): boolean {
  return HISTORY_ROOT_PATHS.has(pathname);
}

/**
 * Logical parent for the in-page back button (#299: the URL is the
 * hierarchy, so the parent is mostly "drop the last segment").
 * Root routes return `null`; use {@link getPageBackFallback} instead.
 */
export function getPageBackHref(pathname: string): PageBackHref | null {
  if (isDashboardRootPath(pathname)) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return "/" as Route;

  const inOrg = !isReservedOrgSlug(parts[0] ?? "");
  // /[org]/[project] → the org's projects list.
  if (inOrg && parts.length === 2 && !isReservedProjectSlug(parts[1] ?? "")) {
    return `/${parts[0]}/projects` as Route;
  }
  // /[org]/projects → org overview (same as dropping the segment).
  return `/${parts.slice(0, -1).join("/")}` as Route;
}

/** Fallback when `router.back()` has no prior history entry. */
export function getPageBackFallback(pathname: string): PageBackHref {
  return getPageBackHref(pathname) ?? ("/" as Route);
}
