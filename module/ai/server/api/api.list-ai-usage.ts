import { requireAction } from "@features/authorization/core/server/authorization.require-action";
import { db } from "@loftlancer/drizzle";
import { aiUsage } from "@loftlancer/drizzle/schema/ai";
import { desc, eq } from "drizzle-orm";
import type { AiOrganizationContext } from "./api.get-ai-policy";

export async function listAiUsage(context: AiOrganizationContext) {
  await requireAction("ai.policy.view", { ...context, audit: false });
  return db
    .select({
      id: aiUsage.id,
      projectId: aiUsage.projectId,
      actorUserId: aiUsage.actorUserId,
      model: aiUsage.model,
      inputTokens: aiUsage.inputTokens,
      outputTokens: aiUsage.outputTokens,
      totalTokens: aiUsage.totalTokens,
      finishReason: aiUsage.finishReason,
      createdAt: aiUsage.createdAt,
    })
    .from(aiUsage)
    .where(eq(aiUsage.organizationId, context.organizationId))
    .orderBy(desc(aiUsage.createdAt))
    .limit(100);
}
