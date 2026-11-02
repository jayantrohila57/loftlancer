import { db } from "@loftlancer/db";
import { organizationAiPolicy } from "@loftlancer/db/schema/ai";
import { requireAction } from "../../../actions/require-action";
import { type AiPolicyPatch, aiPolicyPatchSchema } from "./ai-policy";
import type { AiOrganizationContext } from "./api.get-ai-policy";

export async function updateAiPolicy(
  context: AiOrganizationContext,
  input: AiPolicyPatch,
) {
  const policy = aiPolicyPatchSchema.parse(input);
  await requireAction("ai.policy.update", {
    ...context,
    entityId: context.organizationId,
    payload: {
      allowedModels: policy.allowedModels,
      monthlyTokenLimit: policy.monthlyTokenLimit,
    },
  });

  const [updated] = await db
    .insert(organizationAiPolicy)
    .values({ organizationId: context.organizationId, ...policy })
    .onConflictDoUpdate({
      target: organizationAiPolicy.organizationId,
      set: { ...policy, updatedAt: new Date() },
    })
    .returning();

  if (!updated) {
    throw new Error("AI policy update did not return a row.");
  }

  return updated;
}
