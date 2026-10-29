import { routes } from "@/utils/navigation";

export type ProjectFrameBackTarget = { href: string; label: string };

/** The immediate work-surface parent for routes inside a project frame. */
export function getProjectFrameBackTarget(
  pathname: string,
  org: string,
  slug: string,
): ProjectFrameBackTarget {
  const projectHref = routes.project(org, slug);
  const suffix = pathname.slice(projectHref.length).split("/").filter(Boolean);

  if (suffix.length === 0) {
    return { href: routes.projects(org), label: "Projects" };
  }

  if (suffix[0] === "tasks") {
    return { href: routes.tasks(org, slug), label: "Tasks" };
  }
  if (suffix[0] === "env") {
    return { href: routes.env(org, slug), label: "Environments" };
  }
  if (
    ["access", "invitations", "activity", "settings"].includes(suffix[0] ?? "")
  ) {
    return { href: projectHref, label: "Project overview" };
  }
  if (suffix[0] === "apps") {
    if (suffix[1] === "tasks" && suffix.length > 2) {
      return { href: routes.tasks(org, slug), label: "Tasks" };
    }
    if (suffix[1] === "env" && suffix.length > 2) {
      return { href: routes.env(org, slug), label: "Environments" };
    }
    if (suffix.length > 2 && suffix[1]) {
      return {
        href: routes.app(org, slug, suffix[1]),
        label: "App",
      };
    }
    if (suffix.length > 1) {
      return {
        href: routes.projectSection(org, slug, "apps"),
        label: "Apps",
      };
    }
    return { href: projectHref, label: "Project overview" };
  }

  if (suffix.length === 2 && suffix[1] === "settings") {
    return { href: routes.app(org, slug, suffix[0] ?? ""), label: "App" };
  }
  if (suffix.length === 1) {
    return { href: routes.projectSection(org, slug, "apps"), label: "Apps" };
  }
  return { href: projectHref, label: "Project overview" };
}
