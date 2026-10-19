import { getAppManifest } from "@loftlancer/actions";
import { isReservedProjectSlug } from "@loftlancer/env/reserved-slugs";

/**
 * Route-shape check for everything below /[org] (#306, #309).
 *
 * The [org] and [org]/[project] loading.tsx boundaries stream a skeleton (and
 * the 200 status) before anything inside them renders, so a notFound() thrown
 * by the project layout or a page below it can't change the status any more.
 * The [org] layout therefore resolves the whole request path up front, before
 * its own loading.tsx: this module decides what the path means; the layout
 * runs the matching DB lookups (page-guards.ts).
 *
 * Keep the tables in sync with app/(private)/(shell)/[org]; the unit test
 * walks that folder and fails when a page is missing here.
 */

/** Static pages under /[org] (relative to the org). */
export const ORG_STATIC_ROUTES: readonly string[] = [
  "projects",
  "projects/new",
  "members",
  "teams",
  "invitations",
  "roles",
  "activity",
  "settings",
];

/** Static pages under /[org]/[project] (relative to the project). */
export const PROJECT_STATIC_ROUTES: readonly string[] = [
  "apps",
  "apps/env",
  "apps/env/settings",
  "apps/tasks",
  "apps/tasks/settings",
  "access",
  "invitations",
  "activity",
  "settings",
  "env",
  "env/settings",
  "tasks",
  "tasks/settings",
];

const TASK_NUMBER = /^[1-9]\d{0,8}$/;

export type OrgSubtreePlan =
  /** Nothing to resolve beyond the org (or the path isn't for this org). */
  | { kind: "org" }
  /** The path can't match any real page. */
  | { kind: "not-found" }
  /** /[org]/teams/[teamId]/…: verify the team before streaming. */
  | { kind: "team"; teamId: string }
  /** /[org]/[project]/…: resolve the project, then the optional resource. */
  | {
      kind: "project";
      projectSlug: string;
      resource?:
        | { kind: "env"; envSlug: string }
        | { kind: "task"; number: number };
    };

function decodeSegments(pathname: string): string[] | null {
  try {
    return pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return null;
  }
}

/** Plan for the request path (`x-pathname`, basePath already stripped). */
export function planOrgSubtree(
  pathname: string,
  orgSlug: string,
): OrgSubtreePlan {
  const segments = decodeSegments(pathname);
  if (!segments || segments[0] !== orgSlug) return { kind: "org" };
  const rest = segments.slice(1);
  if (rest.length === 0) return { kind: "org" };

  const [first, ...below] = rest as [string, ...string[]];
  if (first === "teams" && below.length > 0) {
    return below.length === 1 ||
      (below.length === 2 &&
        ["members", "projects", "invitations", "settings"].includes(
          below[1] ?? "",
        ))
      ? { kind: "team", teamId: below[0] ?? "" }
      : { kind: "not-found" };
  }
  // Org-level words (members, projects, …) can never be a project slug.
  if (isReservedProjectSlug(first)) {
    return ORG_STATIC_ROUTES.includes(rest.join("/"))
      ? { kind: "org" }
      : { kind: "not-found" };
  }

  const project = { kind: "project", projectSlug: first } as const;
  if (below.length === 0) return project;
  if (PROJECT_STATIC_ROUTES.includes(below.join("/"))) return project;
  if (below[0] === "apps") {
    const app = below[1];
    if (!app || !getAppManifest(app)) return { kind: "not-found" };
    if (below.length === 2) return project;
    if (below.length !== 3) return { kind: "not-found" };
    const child = below[2] ?? "";
    if (child === "settings") return project;
    if (app === "env") {
      return { ...project, resource: { kind: "env", envSlug: child } };
    }
    if (app === "tasks" && TASK_NUMBER.test(child)) {
      return { ...project, resource: { kind: "task", number: Number(child) } };
    }
    return { kind: "not-found" };
  }
  if (below.length !== 2) return { kind: "not-found" };

  const [section, child] = below as [string, string];
  if (section === "env") {
    return { ...project, resource: { kind: "env", envSlug: child } };
  }
  if (section === "tasks") {
    return TASK_NUMBER.test(child)
      ? { ...project, resource: { kind: "task", number: Number(child) } }
      : { kind: "not-found" };
  }
  // /[project]/[app]/settings: only for registered apps.
  if (child === "settings" && getAppManifest(section)) return project;
  return { kind: "not-found" };
}
