import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { toServiceFieldErrors } from "@module/shared/utils/validation/utils.zod-field-errors.validation";
import {
  organizationProjectInvitationListInputSchema,
  organizationProjectInvitationListOutputSchema,
} from "../../utils/validation/utils.organization-invitations.validation";
import { organizationProjectInvitationListService } from "../service/server.organization-project-invitation-list.service";

export async function organizationProjectInvitationListController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationProjectInvitationListInputSchema.safeParse(input);
  const scoped = parsed.success
    ? { ...ctx, projectId: parsed.data.projectId }
    : ctx;
  const response = await runAction({
    action: "project.read",
    ctx: scoped,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(
        organizationProjectInvitationListOutputSchema,
      ).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the project invitation filters.",
          fieldErrors: toServiceFieldErrors(parsed.error),
        };
      return organizationProjectInvitationListService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(
    organizationProjectInvitationListOutputSchema,
  ).parse(response);
}
