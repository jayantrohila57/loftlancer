/**
 * THE studio route builder (#300). Paths are relative to the studio basePath
 * (`/studio`); Next `Link`/`router` add the basePath. Use `studioUrl()` for
 * absolute links from other apps (auth, docs, notifications, emails).
 *
 *   /                                    org list (pre-org home)
 *   /new                                 create organization
 *   /notifications /activity
 *   /support /support/tickets[/new|/:id] /support/help[/:slug]
 *   /onboarding
 *   /:org                                org overview
 *   /:org/{projects,projects/new,members,teams,teams/:teamId,invitations,roles,activity,settings}
 *   /:org/:project                       project overview
 *   /:org/:project/{apps,settings}
 *   /:org/:project/env[/:envSlug]        env app
 *   /:org/:project/tasks[/:number]       tasks app
 *   /:org/:project/:app[/settings]       any app
 */
export type OrgSection =
  | "projects"
  | "members"
  | "teams"
  | "invitations"
  | "roles"
  | "activity"
  | "settings";

export type ProjectSection = "apps" | "settings";

const seg = (value: string | number) => encodeURIComponent(String(value));

export const routes = {
  home: () => "/",
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
  projects: (org: string) => `/${seg(org)}/projects`,
  newProject: (org: string) => `/${seg(org)}/projects/new`,

  project: (org: string, project: string) => `/${seg(org)}/${seg(project)}`,
  projectSection: (org: string, project: string, section: ProjectSection) =>
    `/${seg(org)}/${seg(project)}/${section}`,
  app: (org: string, project: string, app: string) =>
    `/${seg(org)}/${seg(project)}/${seg(app)}`,
  appSettings: (org: string, project: string, app: string) =>
    `/${seg(org)}/${seg(project)}/${seg(app)}/settings`,
  env: (org: string, project: string, envSlug?: string) =>
    `/${seg(org)}/${seg(project)}/env${envSlug ? `/${seg(envSlug)}` : ""}`,
  tasks: (org: string, project: string) => `/${seg(org)}/${seg(project)}/tasks`,
  task: (org: string, project: string, number: number | string) =>
    `/${seg(org)}/${seg(project)}/tasks/${seg(number)}`,
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
      return routes.home();
    case "projects":
      return org ? routes.projects(org) : null;
    case "activity":
      return org ? routes.orgSection(org, "activity") : routes.activity();
    case "notifications":
      return routes.notifications();
  }
}
