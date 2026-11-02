import { publicProcedure, router } from "../index";
import { auditLogsRouter } from "./audit";
import { auditEventsRouter } from "./audit-events";
import { dashboardRouter } from "./dashboard";
import { environmentsRouter } from "./environments";
import { mailboxRouter } from "./mailbox";
import { notificationsRouter } from "./notifications";
import { organizationsRouter } from "./organizations";
import { permissionsRouter } from "./permissions";
import { projectAccessRouter } from "./project-access-router";
import { projectAppsRouter } from "./project-apps";
import { projectsRouter } from "./projects";
import { sidebarRouter } from "./sidebar";
import { supportRouter } from "./support";
import { tasksRouter } from "./tasks";
import { teamsRouter } from "./teams";
import { environmentVariablesRouter } from "./variables";

/** Product router for `apps/studio` — org/project/env surface without account settings. */
export const studioRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  dashboard: dashboardRouter,
  projects: projectsRouter,
  environments: environmentsRouter,
  environmentVariables: environmentVariablesRouter,
  auditLogs: auditLogsRouter,
  auditEvents: auditEventsRouter,
  notifications: notificationsRouter,
  mailbox: mailboxRouter,
  sidebar: sidebarRouter,
  permissions: permissionsRouter,
  organizations: organizationsRouter,
  projectAccess: projectAccessRouter,
  teams: teamsRouter,
  support: supportRouter,
  projectApps: projectAppsRouter,
  tasks: tasksRouter,
});

export type StudioRouter = typeof studioRouter;
