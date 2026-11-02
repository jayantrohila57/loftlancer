import { sessionUserIsPlatformAdmin } from "@loftlancer/actions/platform-admin-flag";
import { getSessionActiveOrganizationId } from "@loftlancer/auth/session-types";
import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { ORPCError, os } from "@orpc/server";
import type { Context } from "../create-context";
import { runWithPlatformAdminContext } from "../platform-admin-context";
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
