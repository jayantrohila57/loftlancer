import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationMemberRemoveInputSchema,
  organizationMemberRemoveOutputSchema,
} from "../../utils/validation/utils.organization-members.validation";
import { organizationMemberRemoveService } from "../service/server.organization-member-remove.service";

export async function organizationMemberRemoveController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationMemberRemoveInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        targetUserId: parsed.data.userId,
        payload: parsed.data.reason
          ? { removalReason: parsed.data.reason }
          : undefined,
      }
    : ctx;
  const response = await runAction({
    action: "member.remove",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(organizationMemberRemoveOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the organization member details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return organizationMemberRemoveService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(organizationMemberRemoveOutputSchema).parse(
    response,
  );
}
