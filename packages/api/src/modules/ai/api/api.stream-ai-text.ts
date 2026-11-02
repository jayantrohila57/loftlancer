import { db } from "@loftlancer/db";
import { organizationAiPolicy } from "@loftlancer/db/schema/ai";
import { env } from "@loftlancer/env/server";
import { TRPCError } from "@trpc/server";
import { gateway, streamText } from "ai";
import { requireAction } from "../../../actions/require-action";
import { loadAiPolicy } from "./ai-policy-store";
import type { AiOrganizationContext } from "./api.get-ai-policy";
import { recordAiUsage } from "./api.record-ai-usage";

export type StreamAiTextInput = {
  model: string;
  prompt: string;
  projectId?: string | null;
  maxOutputTokens?: number;
  abortSignal?: AbortSignal;
};

/**
 * Central server-side AI Gateway entry point. No prompt or completion is
 * persisted; only provider usage metadata is recorded after the stream ends.
 */
export async function streamAiText(
  context: AiOrganizationContext,
  input: StreamAiTextInput,
) {
  if (!env.AI_GATEWAY_API_KEY) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "AI generation is not configured on this server.",
    });
  }

  await requireAction("ai.generation.create", {
    ...context,
    projectId: input.projectId ?? null,
    payload: { model: input.model },
  });
  const policy = await loadAiPolicy(context.organizationId);

  if (!policy.allowedModels.includes(input.model)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This AI model is not allowed for the organization.",
    });
  }

  const tokensRemaining = policy.monthlyTokenLimit - policy.monthlyTokensUsed;
  if (tokensRemaining <= 0) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "This organization has reached its monthly AI token limit.",
    });
  }

  // A policy must exist before usage can be atomically accumulated. Creating
  // the default is an internal initialization, not a user policy change.
  await db
    .insert(organizationAiPolicy)
    .values({ organizationId: context.organizationId })
    .onConflictDoNothing();

  const maxOutputTokens = Math.min(
    input.maxOutputTokens ?? 1_024,
    4_096,
    tokensRemaining,
  );

  return streamText({
    model: gateway(input.model),
    prompt: input.prompt,
    maxOutputTokens,
    abortSignal: input.abortSignal,
    maxRetries: 1,
    streamRetries: 1,
    onEnd: async (event) => {
      await recordAiUsage({
        callId: event.callId,
        organizationId: context.organizationId,
        projectId: input.projectId,
        actorUserId: context.userId,
        model: input.model,
        inputTokens: event.usage.inputTokens,
        outputTokens: event.usage.outputTokens,
        finishReason: event.finishReason,
      });
    },
  });
}
