import {
  isReservedOrgSlug,
  isReservedProjectSlug,
} from "@loftlancer/ui/studio-routes";
import type { Route } from "next";
import type { OrgListItem } from "@/components/org/active-organization-context";
import { routes } from "@/utils/navigation";

/**
 * Where to go after switching org (#299). The org is in the URL, so an
 * org-scoped page moves to the same place in the new org; a project page
 * keeps its path only when the new org has a project with that slug.
 * User-level pages (support, notifications…) stay put.
 */
export function pathAfterOrganizationSwitch(
  pathname: string,
  nextOrg: OrgListItem | undefined,
  projectSlugs: ReadonlySet<string>,
): Route | null {
  if (!nextOrg) {
    return routes.organizations();
  }
  const parts = pathname.split("/").filter(Boolean);
  const [orgSlug, second, ...rest] = parts;
  if (!orgSlug || isReservedOrgSlug(orgSlug)) {
    return null;
  }
  if (orgSlug === nextOrg.slug) {
    return null;
  }
  if (!second) {
    return routes.org(nextOrg.slug);
  }
  if (isReservedProjectSlug(second)) {
    return `/${[nextOrg.slug, second, ...rest].join("/")}` as Route;
  }
  if (projectSlugs.has(second)) {
    return `/${[nextOrg.slug, second, ...rest].join("/")}` as Route;
  }
  return routes.projects(nextOrg.slug);
}
