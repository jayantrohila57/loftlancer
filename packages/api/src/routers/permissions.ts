import { z } from "zod/v3";
import { buildPermissionsSnapshot } from "../actions/permissions-snapshot";
import { orgAwareProcedure, router } from "../index";
import { getActiveOrganizationId } from "../org-access";

export const permissionsRouter = router({
  // Reports the caller's own capabilities (all false without an org), so it is
  // not action-gated; zero-org users need it to reach onboarding.
  snapshot: orgAwareProcedure
    .input(
      z
        .object({
          projectId: z.string().optional(),
          teamId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const organizationId = getActiveOrganizationId(ctx.session);
      return buildPermissionsSnapshot({
        userId: ctx.session.user.id,
        organizationId,
        projectId: input?.projectId,
        teamId: input?.teamId,
      });
    }),
});
