import type { Route } from "next";

/**
 * THE studio route builder (#300). Paths are relative to the studio basePath
 * (`/studio`); Next `Link`/`router` add the basePath. Use `studioUrl()` for
 * absolute links from other apps (auth, docs, notifications, emails).
 *
 *   /                                    Studio landing page
 *   /organizations                       organization directory
 *   /new                                 create organization
 *   /notifications /activity
 *   /support /support/tickets[/new|/:id] /support/help[/:slug]
 *   /onboarding
 *   /:org                                org overview
 *   /:org/{projects,projects/new,members,teams,teams/:teamId,invitations,roles,activity,settings}
 *   /:org/teams/:teamId/{members,projects,invitations,settings}
 *   /:org/:project                       project overview
 *   /:org/:project/{apps,access,invitations,activity,settings}
 *   /:org/:project/apps/env[/:envSlug]   Environments app
 *   /:org/:project/apps/tasks[/:number]  Tasks app
 *   /:org/:project/apps/:app[/settings]  registered app
 *   Legacy /:org/:project/{env,tasks} URLs permanently redirect to apps/*.
 *
 * Ownership: organization owns membership, org roles, security and org invites;
 * project owns configuration, direct access, installed apps and project invites;
 * team owns its members, team role and linked projects; installed app owns its
 * configuration and (when enabled) app-scoped access. Account settings are
 * user-scoped. An app is always nested under its project.
 */
export type OrgSection =
  | "projects"
  | "members"
  | "teams"
  | "invitations"
  | "roles"
  | "activity"
  | "settings";

export type ProjectSection =
  | "apps"
  | "access"
  | "invitations"
  | "activity"
  | "settings";

export type TeamSection = "members" | "projects" | "invitations" | "settings";

const seg = (value: string | number) => encodeURIComponent(String(value));

export const routes = {
  home: () => "/",
  organizations: () => "/organizations",
  organizationsDirectory: () => "/organizations?directory=1" as Route,
  newOrganization: () => "/new",
  notifications: () => "/notifications",
  invitation: (id: string) => `/invite/${seg(id)}`,
  activity: () => "/activity",
  onboarding: () => "/onboarding",
  support: () => "/support",
  supportTickets: () => "/support/tickets",
  supportNewTicket: () => "/support/tickets/new",
  supportTicket: (id: string) => `/support/tickets/${seg(id)}`,
  supportHelp: () => "/support/help",
  supportArticle: (slug: string) => `/support/help/${seg(slug)}`,

  org: (org: string) => `/${seg(org)}`,
  orgSection: (org: string, section: OrgSection) => `/${seg(org)}/${section}`,
  team: (org: string, teamId: string) => `/${seg(org)}/teams/${seg(teamId)}`,
  teamSection: (org: string, teamId: string, section: TeamSection) =>
    `/${seg(org)}/teams/${seg(teamId)}/${section}`,
  projects: (org: string) => `/${seg(org)}/projects`,
  newProject: (org: string) => `/${seg(org)}/projects/new`,

  project: (org: string, project: string) => `/${seg(org)}/${seg(project)}`,
  projectSection: (org: string, project: string, section: ProjectSection) =>
    `/${seg(org)}/${seg(project)}/${section}`,
  app: (org: string, project: string, app: string) =>
    `/${seg(org)}/${seg(project)}/apps/${seg(app)}`,
  appSettings: (org: string, project: string, app: string) =>
    `/${seg(org)}/${seg(project)}/apps/${seg(app)}/settings`,
  env: (org: string, project: string, envSlug?: string) =>
    `/${seg(org)}/${seg(project)}/apps/env${envSlug ? `/${seg(envSlug)}` : ""}`,
  tasks: (org: string, project: string) =>
    `/${seg(org)}/${seg(project)}/apps/tasks`,
  task: (org: string, project: string, number: number | string) =>
    `/${seg(org)}/${seg(project)}/apps/tasks/${seg(number)}`,
} as const;

export {
  isReservedOrgSlug,
  isReservedProjectSlug,
  RESERVED_ORG_SLUGS,
  RESERVED_PROJECT_SLUGS,
} from "@loftlancer/env/reserved-slugs";

/** Absolute studio URL for cross-app links. */
export function studioUrl(path: string, studioOrigin: string): string {
  return `${studioOrigin.replace(/\/$/, "")}${path === "/" ? "" : path}`;
}

/** Sidebar platform entries → studio path (null when the entry needs an org). */
export function platformNavHref(
  key: "organizations" | "projects" | "activity" | "notifications",
  org?: string | null,
): string | null {
  switch (key) {
    case "organizations":
      return routes.organizationsDirectory();
    case "projects":
      return org ? routes.projects(org) : null;
    case "activity":
      return org ? routes.orgSection(org, "activity") : routes.activity();
    case "notifications":
      return routes.notifications();
  }
}
