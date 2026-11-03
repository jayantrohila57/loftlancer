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
import { permissionsRouter } from "./permissions";
import { sidebarRouter } from "./sidebar";
import { tasksRouter } from "./tasks";
import { environmentVariablesRouter } from "./variables";

/** App router after product reset — org/teams/projects/apps domain routers removed. */
export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  dashboard: dashboardRouter,
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
  sidebar: sidebarRouter,
  tasks: tasksRouter,
});
export type AppRouter = typeof appRouter;
