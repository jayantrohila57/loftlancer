import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { toServiceFieldErrors } from "@module/shared/utils/validation/utils.zod-field-errors.validation";
import {
  organizationInvitationIdInputSchema,
  organizationInvitationMutationOutputSchema,
} from "../../utils/validation/utils.organization-invitations.validation";
import { organizationInvitationRevokeService } from "../service/server.organization-invitation-revoke.service";

export async function organizationInvitationRevokeController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationInvitationIdInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        entityId: parsed.data.invitationId,
        payload: { operation: "revoke" },
      }
    : ctx;
  const response = await runAction({
    action: "invitation.cancel",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(organizationInvitationMutationOutputSchema).parse(
        result,
      ),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the invitation details.",
          fieldErrors: toServiceFieldErrors(parsed.error),
        };
      return organizationInvitationRevokeService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(
    organizationInvitationMutationOutputSchema,
  ).parse(response);
}
