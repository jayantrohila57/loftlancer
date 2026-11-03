import { requireAction } from "@features/authorization/core/server/authorization.require-action";
import { loadAiPolicy } from "./ai-policy-store";

export type AiOrganizationContext = {
  userId: string;
  organizationId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function getAiPolicy(context: AiOrganizationContext) {
  await requireAction("ai.policy.view", {
    ...context,
    audit: false,
  });
  return loadAiPolicy(context.organizationId);
}
