import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { toServiceFieldErrors } from "@module/shared/utils/validation/utils.zod-field-errors.validation";
import {
  organizationInvitationListInputSchema,
  organizationInvitationListOutputSchema,
} from "../../utils/validation/utils.organization-invitations.validation";
import { organizationInvitationListService } from "../service/server.organization-invitation-list.service";

export async function organizationInvitationListController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationInvitationListInputSchema.safeParse(input);
  const scoped = parsed.success
    ? { ...ctx, orgId: parsed.data.organizationId }
    : ctx;
  const response = await runAction({
    action: "member.list",
    ctx: scoped,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(organizationInvitationListOutputSchema).parse(
        result,
      ),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the invitation filters.",
          fieldErrors: toServiceFieldErrors(parsed.error),
        };
      return organizationInvitationListService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(organizationInvitationListOutputSchema).parse(
    response,
  );
}
