import type { ProjectOutput } from "@loftlancer/api/types";
import { routes } from "@loftlancer/ui/studio-routes";

/** Slugs that must never appear as sidebar project shortcuts (route collisions). */
export const SIDEBAR_PROJECT_SLUG_BLOCKLIST = new Set([
  "organization",
  "organizations",
  "settings",
  "new",
  "activity",
  "onboarding",
]);

export function isSidebarProjectNavItem(project: ProjectOutput): boolean {
  const slug = project.slug?.trim().toLowerCase();
  if (!slug) return false;
  return !SIDEBAR_PROJECT_SLUG_BLOCKLIST.has(slug);
}

export function isSidebarProjectRouteActive(
  pathname: string,
  organizationSlug: string,
  projectSlug: string,
): boolean {
  const href = routes.project(organizationSlug, projectSlug);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isSidebarRouteActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function sortProjectsByUpdated(projects: ProjectOutput[]) {
  return [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function selectSidebarProjects({
  projects,
  activeSlug,
  listExpanded,
  limit = 3,
}: {
  projects: ProjectOutput[];
  activeSlug?: string | null;
  listExpanded: boolean;
  limit?: number;
}): {
  visible: ProjectOutput[];
  hiddenCount: number;
  listToggleVisible: boolean;
} {
  const sorted = sortProjectsByUpdated(
    projects.filter(isSidebarProjectNavItem),
  );
  const listToggleVisible = sorted.length > limit;

  if (listExpanded) {
    return { visible: sorted, hiddenCount: 0, listToggleVisible };
  }

  if (sorted.length <= limit) {
    return { visible: sorted, hiddenCount: 0, listToggleVisible: false };
  }

  const recent = sorted.slice(0, limit);
  const active = activeSlug
    ? sorted.find((p) => p.slug === activeSlug)
    : undefined;

  if (!active || recent.some((p) => p.slug === activeSlug)) {
    return {
      visible: recent,
      hiddenCount: Math.max(0, sorted.length - recent.length),
      listToggleVisible,
    };
  }

  const visible = [active, ...sorted.filter((p) => p.id !== active.id)].slice(
    0,
    limit,
  );
  return {
    visible,
    hiddenCount: Math.max(0, sorted.length - visible.length),
    listToggleVisible,
  };
}
