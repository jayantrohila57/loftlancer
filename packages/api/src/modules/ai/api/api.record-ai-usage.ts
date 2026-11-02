import { db } from "@loftlancer/db";
import { aiUsage, organizationAiPolicy } from "@loftlancer/db/schema/ai";
import { eq, sql } from "drizzle-orm";
import { normalizeTokenCount } from "./ai-policy";

export type RecordAiUsageInput = {
  callId: string;
  organizationId: string;
  projectId?: string | null;
  actorUserId: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  finishReason?: string | null;
};

/** Records provider usage once. Content is deliberately never persisted. */
export async function recordAiUsage(input: RecordAiUsageInput) {
  const inputTokens = normalizeTokenCount(input.inputTokens);
  const outputTokens = normalizeTokenCount(input.outputTokens);
  const totalTokens = inputTokens + outputTokens;

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(aiUsage)
      .values({
        id: crypto.randomUUID(),
        gatewayCallId: input.callId,
        organizationId: input.organizationId,
        projectId: input.projectId ?? null,
        actorUserId: input.actorUserId,
        model: input.model,
        inputTokens,
        outputTokens,
        totalTokens,
        finishReason: input.finishReason ?? null,
      })
      .onConflictDoNothing({ target: aiUsage.gatewayCallId })
      .returning({ id: aiUsage.id });

    if (inserted.length === 0 || totalTokens === 0) return;

    await tx
      .update(organizationAiPolicy)
      .set({
        monthlyTokensUsed: sql`${organizationAiPolicy.monthlyTokensUsed} + ${totalTokens}`,
        updatedAt: new Date(),
      })
      .where(eq(organizationAiPolicy.organizationId, input.organizationId));
  });
}
