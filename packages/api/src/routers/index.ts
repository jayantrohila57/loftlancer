import { publicProcedure, router } from "../index";
import { accountRouter } from "./account";
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
import { projectAccessRouter } from "./project-access-router";
import { projectAppsRouter } from "./project-apps";
import { projectsRouter } from "./projects";
import { sidebarRouter } from "./sidebar";
import { tasksRouter } from "./tasks";
import { teamsRouter } from "./teams";
import { environmentVariablesRouter } from "./variables";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  dashboard: dashboardRouter,
  projects: projectsRouter,
  environments: environmentsRouter,
  files: filesRouter,
  environmentVariables: environmentVariablesRouter,
  ai: aiRouter,
  auditLogs: auditLogsRouter,
  auditEvents: auditEventsRouter,
  notifications: notificationsRouter,
  mailbox: mailboxRouter,
  permissions: permissionsRouter,
  account: accountRouter,
  organizations: organizationsRouter,
  projectAccess: projectAccessRouter,
  teams: teamsRouter,
  sidebar: sidebarRouter,
  projectApps: projectAppsRouter,
  tasks: tasksRouter,
});
export type AppRouter = typeof appRouter;
