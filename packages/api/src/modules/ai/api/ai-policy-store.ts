import { db } from "@loftlancer/db";
import { organizationAiPolicy } from "@loftlancer/db/schema/ai";
import { eq } from "drizzle-orm";
import { DEFAULT_AI_MODELS, DEFAULT_MONTHLY_TOKEN_LIMIT } from "./ai-policy";

/** Loads policy without performing authorization; callers must authorize first. */
export async function loadAiPolicy(organizationId: string) {
  const [policy] = await db
    .select()
    .from(organizationAiPolicy)
    .where(eq(organizationAiPolicy.organizationId, organizationId))
    .limit(1);

  return (
    policy ?? {
      organizationId,
      allowedModels: [...DEFAULT_AI_MODELS],
      monthlyTokenLimit: DEFAULT_MONTHLY_TOKEN_LIMIT,
      monthlyTokensUsed: 0,
      periodStartedAt: null,
      updatedAt: null,
    }
  );
}
