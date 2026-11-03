import { aiPolicyPatchSchema } from "@modules/ai/server/api/ai-policy";
import { getAiPolicy } from "@modules/ai/server/api/api.get-ai-policy";
import { listAiUsage } from "@modules/ai/server/api/api.list-ai-usage";
import { updateAiPolicy } from "@modules/ai/server/api/api.update-ai-policy";
import { z } from "zod/v3";
import { orgProcedure, router } from "../index";

function aiContext(ctx: {
  session: { user: { id: string } };
  activeOrganizationId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  if (!ctx.activeOrganizationId)
    throw new Error("Active organization required");
  return {
    userId: ctx.session.user.id,
    organizationId: ctx.activeOrganizationId,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  };
}

/** Policy and metering surface. Generation stays server-only until a product module consumes it. */
export const aiRouter = router({
  getPolicy: orgProcedure.query(({ ctx }) => getAiPolicy(aiContext(ctx))),
  updatePolicy: orgProcedure
    .input(aiPolicyPatchSchema)
    .mutation(({ ctx, input }) => updateAiPolicy(aiContext(ctx), input)),
  usage: orgProcedure.query(({ ctx }) => listAiUsage(aiContext(ctx))),
  validateModel: orgProcedure
    .input(z.object({ model: z.string().trim().min(1) }))
    .query(async ({ ctx, input }) => {
      const policy = await getAiPolicy(aiContext(ctx));
      return { allowed: policy.allowedModels.includes(input.model) };
    }),
});
