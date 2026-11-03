import { publicProcedure, router } from "../index";
import { aiRouter } from "./ai";
import { auditLogsRouter } from "./audit";
import { auditEventsRouter } from "./audit-events";
import { dashboardRouter } from "./dashboard";
import { environmentsRouter } from "./environments";
import { filesRouter } from "./files";
import { mailboxRouter } from "./mailbox";
import { notificationsRouter } from "./notifications";
import { organizationsRouter } from "./organizations";
import { permissionsRouter } from "./permissions";
import { projectAccessRouter } from "./project-access";
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
  environments: environmentsRouter,
  files: filesRouter,
  environmentVariables: environmentVariablesRouter,
  ai: aiRouter,
  auditLogs: auditLogsRouter,
  auditEvents: auditEventsRouter,
  notifications: notificationsRouter,
  mailbox: mailboxRouter,
  sidebar: sidebarRouter,
  permissions: permissionsRouter,
  organizations: organizationsRouter,
  projectAccess: projectAccessRouter,
  projectApps: projectAppsRouter,
  projects: projectsRouter,
  support: supportRouter,
  tasks: tasksRouter,
  teams: teamsRouter,
});

export type StudioRouter = typeof studioRouter;
