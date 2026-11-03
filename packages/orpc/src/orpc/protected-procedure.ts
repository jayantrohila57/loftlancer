import { runWithPlatformAdminContext } from "@features/authorization/core/server/authorization.platform-admin-context";
import { sessionUserIsPlatformAdmin } from "@features/authorization/utils/authorization.platform-admin-flag";
import { getSessionActiveOrganizationId } from "@loftlancer/better-auth/session-types";
import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import { ORPCError, os } from "@orpc/server";
import type { Context } from "../core/orpc.create-context";
export const protectedProcedure = os
  .$context<Context>()
  .use(async ({ context, next }) => {
    if (!context.session) throw new ORPCError("UNAUTHORIZED");
    const session = context.session;
    return runWithPlatformAdminContext(
      sessionUserIsPlatformAdmin(session.user as { role?: string | null }),
      () =>
        next({
          context: {
            ...context,
            session,
            userId: session.user.id,
            orgId: isOrganizationsEnabled()
              ? getSessionActiveOrganizationId(session)
              : null,
            projectId: null,
            teamId: null,
            ip: context.ipAddress ?? null,
            userAgent: context.userAgent ?? null,
          },
        }),
    );
  });
