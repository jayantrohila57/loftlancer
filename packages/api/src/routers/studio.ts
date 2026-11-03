import { publicProcedure, router } from "../index";
import { aiRouter } from "./ai";
import { auditLogsRouter } from "./audit";
import { auditEventsRouter } from "./audit-events";
import { dashboardRouter } from "./dashboard";
import { environmentsRouter } from "./environments";
import { filesRouter } from "./files";
import { mailboxRouter } from "./mailbox";
import { notificationsRouter } from "./notifications";
import { permissionsRouter } from "./permissions";
import { sidebarRouter } from "./sidebar";
import { supportRouter } from "./support";
import { tasksRouter } from "./tasks";
import { environmentVariablesRouter } from "./variables";

/** Studio product router — org/teams/projects/marketplace-apps removed. */
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
  support: supportRouter,
  tasks: tasksRouter,
});

export type StudioRouter = typeof studioRouter;
