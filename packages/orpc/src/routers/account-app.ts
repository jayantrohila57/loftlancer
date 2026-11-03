import { actionGuard } from "../actions/action-guard";
import { protectedProcedure, publicProcedure, router } from "../index";
import { accountRouter } from "./account";
import { auditEventsRouter } from "./audit-events";
import { fetchUserAccountStats } from "./dashboard";
import { notificationsRouter } from "./notifications";
import { permissionsRouter } from "./permissions";
import { sidebarRouter } from "./sidebar";

/** Account app router — profile/sessions/export/delete + self-scoped audit timeline. */
export const accountAppRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  account: accountRouter,
  auditEvents: auditEventsRouter,
  dashboard: router({
    getUserAccountStats: protectedProcedure
      .use(actionGuard("profile.view"))
      .query(async ({ ctx }) => fetchUserAccountStats(ctx.session.user.id)),
  }),
  // Header bell, shared with studio (#319).
  notifications: notificationsRouter,
  permissions: permissionsRouter,
  sidebar: sidebarRouter,
});

export type AccountAppRouter = typeof accountAppRouter;
