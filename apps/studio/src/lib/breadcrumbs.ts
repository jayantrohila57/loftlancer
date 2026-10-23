import {
  isReservedOrgSlug,
  isReservedProjectSlug,
} from "@loftlancer/ui/studio-routes";
import { deSlug } from "./utils";

const STATIC_LABELS: Record<string, string> = {
  new: "New",
  activity: "Activity",
  onboarding: "Onboarding",
  members: "Members",
  teams: "Teams",
  invitations: "Invitations",
  roles: "Roles & access",
  settings: "Settings",
  profile: "Profile",
  sessions: "Sessions",
  accounts: "Connected accounts",
  export: "Export",
  delete: "Delete account",
  timeline: "Activity",
  projects: "Projects",
  notifications: "Notifications",
  env: "Environments",
  tasks: "Tasks",
  apps: "Apps",
  support: "Support",
  tickets: "Tickets",
  help: "Help",
};

export type BreadcrumbKind =
  | "static"
  | "org"
  | "project"
  | "team"
  | "app"
  | "ticket"
  | "task"
  | "notFound";

export type BreadcrumbCrumb = {
  href: string;
  segment: string;
  kind: BreadcrumbKind;
};

export function generateBreadcrumbs(pathname: string): BreadcrumbCrumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const userLevel = parts[0] ? isReservedOrgSlug(parts[0]) : true;
  return parts.map((segment, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    let kind: BreadcrumbKind = "static";
    if (userLevel) {
      if (
        parts[0] === "support" &&
        parts[1] === "tickets" &&
        index === 2 &&
        segment !== "new"
      ) {
        kind = "ticket";
      }
    } else if (index === 0) {
      kind = "org";
    } else if (index === 1 && parts[1] === "teams") {
      kind = "static";
    } else if (index === 1 && !isReservedProjectSlug(segment)) {
      kind = "project";
    } else if (index === 2 && parts[1] === "teams") {
      kind = "team";
    } else if (
      index === 2 &&
      parts[1] &&
      !isReservedProjectSlug(parts[1]) &&
      !["apps", "access", "invitations", "activity", "settings"].includes(
        segment,
      )
    ) {
      kind = "app";
    } else if (
      (index === 3 && parts[2] === "tasks") ||
      (index === 4 && parts[2] === "apps" && parts[3] === "tasks")
    ) {
      if (segment !== "settings") kind = "task";
    }
    return { href, segment, kind };
  });
}

export function resolveBreadcrumbLabel(
  crumb: BreadcrumbCrumb,
  names: {
    organizationName?: string;
    projectName?: string;
    teamName?: string;
    supportTicketLabel?: string;
  } = {},
): string {
  if (crumb.kind === "notFound") return "Not found";
  if (crumb.segment === "settings") {
    const segments = crumb.href.split("/").filter(Boolean);
    if (segments.includes("teams")) return "Team settings";
    if (
      segments.some((segment) => ["apps", "env", "tasks"].includes(segment))
    ) {
      return "App settings";
    }
    if (segments.length === 2) return "Organization settings";
    if (segments.length === 3) return "Project settings";
  }

  if (crumb.kind === "team") return names.teamName || "Team";
  if (crumb.kind === "org") {
    return names.organizationName || crumb.segment;
  }
  if (crumb.kind === "project") {
    return names.projectName || crumb.segment;
  }
  if (crumb.kind === "ticket") {
    return names.supportTicketLabel || "Ticket";
  }
  if (crumb.kind === "task") return `Task #${crumb.segment}`;
  return STATIC_LABELS[crumb.segment] ?? deSlug(crumb.segment);
}
